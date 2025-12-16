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

    // Get user info
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    // Get workspaces for user
    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select('id, title, description, type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching workspaces:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Fetched ${workspaces?.length || 0} workspaces for user ${userId}`);

    return NextResponse.json({
      workspaces: workspaces || [],
      user: userData,
    });
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
    const { title, description } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || '',
        type: 'custom',
        created_at: new Date().toISOString(),
      })
      .select('id, title, description, type, created_at')
      .single();

    if (error) {
      console.error('❌ Error creating workspace:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Created workspace "${title}" for user ${userId}`);

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (err) {
    console.error('❌ Auth error:', err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
