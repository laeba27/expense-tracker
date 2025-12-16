import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  console.log('🔍 [SUPABASE-TEST] Testing Supabase connection...');

  try {
    // Simple test: try to query the users table
    const { data, error } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(0);

    if (error) {
      console.error('❌ [SUPABASE-TEST] Error:', error.message);
      return NextResponse.json(
        {
          status: 'ERROR',
          message: 'Supabase connection test failed',
          error: error.message,
          solution: 'The users table may not exist. Run SQL from DEBUG_REGISTRATION.md'
        },
        { status: 500 }
      );
    }

    console.log('✅ [SUPABASE-TEST] Connection successful!');

    return NextResponse.json(
      {
        status: 'SUCCESS ✅',
        message: 'Supabase is connected and users table is accessible!',
        connection: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        nextSteps: [
          '1. Make sure password column exists in users table',
          '2. Go to http://localhost:3000/auth/register',
          '3. Fill the form and submit',
          '4. Check server logs for detailed output'
        ]
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [SUPABASE-TEST] Critical error:', errorMessage);

    return NextResponse.json(
      {
        status: 'ERROR ❌',
        message: 'Supabase connection failed',
        error: errorMessage,
        checklist: {
          '1_Env_Variables': 'Check if .env.local exists and has Supabase keys',
          '2_Supabase_URL': 'Verify NEXT_PUBLIC_SUPABASE_URL starts with https://',
          '3_Keys': 'Verify NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are not empty',
          '4_Network': 'Check if you can access https://app.supabase.com'
        }
      },
      { status: 500 }
    );
  }
}
