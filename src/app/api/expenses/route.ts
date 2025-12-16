import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DecodedToken {
  userId: string;
  user_id?: string;
  email: string;
  name?: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const userId = decoded.userId || decoded.user_id;

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    // Build query
    let query = supabase
      .from('expenses')
      .select('id, amount, description, category, date, workspace_id')
      .eq('user_id', userId);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data: allExpenses, error } = await query;

    if (error) {
      console.error('❌ Error fetching expenses:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by month/year on client-side (since Supabase date filtering is complex)
    const expenses = (allExpenses || []).filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
    });

    console.log(`✅ Fetched ${expenses.length} expenses for user ${userId}, workspace ${workspaceId}`);

    return NextResponse.json({ expenses });
  } catch (err) {
    console.error('❌ Auth error:', err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const userId = decoded.userId || decoded.user_id;
    const { amount, description, category, date, workspace_id } = await request.json();

    if (!amount || !description || !category || !date || !workspace_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        workspace_id,
        amount: parseFloat(amount),
        description,
        category,
        date,
        created_at: new Date().toISOString(),
      })
      .select('id, amount, description, category, date, workspace_id')
      .single();

    if (error) {
      console.error('❌ Error creating expense:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Created expense ₹${amount} in workspace ${workspace_id} for user ${userId}`);

    return NextResponse.json({ expense }, { status: 201 });
  } catch (err) {
    console.error('❌ Auth error:', err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
