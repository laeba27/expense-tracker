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
      .select('amount, category, date')
      .eq('user_id', userId);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data: allExpenses, error } = await query;

    if (error) {
      console.error('❌ Error fetching expenses for summary:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by month/year and calculate summary
    const expenses = (allExpenses || []).filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
    });

    const totalSpend = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const categoryWise: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      const category = expense.category || 'Other';
      categoryWise[category] = (categoryWise[category] || 0) + (expense.amount || 0);
    });

    console.log(`✅ Generated summary for user ${userId}, workspace ${workspaceId}: ₹${totalSpend}`);

    return NextResponse.json({
      summary: {
        totalSpend,
        categoryWise,
        expenseCount: expenses.length,
      },
    });
  } catch (err) {
    console.error('❌ Auth error:', err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
