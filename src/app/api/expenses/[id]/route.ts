import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth } from '@/lib/middleware';
import { validateExpense } from '@/lib/validators';

// Update expense
async function updateExpense(req: NextRequest, context: any) {
  try {
    const user = (req as any).user;
    const id = context.params.id;
    const { amount, description, category, date } = await req.json();

    if (!validateExpense(amount, description, category)) {
      return NextResponse.json(
        { error: 'Invalid expense data' },
        { status: 400 }
      );
    }

    // Check if expense belongs to user
    const { data: expense } = await supabase
      .from('expenses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.userId)
      .single();

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found or unauthorized' },
        { status: 404 }
      );
    }

    const { data: updated, error } = await supabase
      .from('expenses')
      .update({
        amount,
        description,
        category,
        date,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update expense' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Expense updated successfully', expense: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete expense
async function deleteExpense(req: NextRequest, context: any) {
  try {
    const user = (req as any).user;
    const id = context.params.id;

    // Check if expense belongs to user
    const { data: expense } = await supabase
      .from('expenses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.userId)
      .single();

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found or unauthorized' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete expense' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Expense deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(updateExpense);
export const DELETE = withAuth(deleteExpense);
