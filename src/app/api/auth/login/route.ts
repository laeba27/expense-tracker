import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { generateAuthToken } from '@/lib/jwt';
import { validateEmail } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    console.log('🔑 [LOGIN] Received login request for:', email);

    // Validate email format
    if (!validateEmail(email)) {
      console.warn('❌ [LOGIN] Invalid email format:', email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check password exists
    if (!password || password.length === 0) {
      console.warn('❌ [LOGIN] Password missing or empty');
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    console.log('🔍 [LOGIN] Looking up user in database...');

    // Find user by email - SELECT only needed columns
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, password, is_verified')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      console.warn('❌ [LOGIN] User not found in database:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ [LOGIN] User found - email:', user.email, 'verified:', user.is_verified);

    // Check if user is verified
    if (!user.is_verified) {
      console.warn('⚠️ [LOGIN] User email NOT verified yet - cannot login:', email);
      return NextResponse.json(
        { error: 'Please verify your email first. Check your inbox for verification link.' },
        { status: 403 }
      );
    }

    console.log('✅ [LOGIN] Email verified - checking password...');

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn('❌ [LOGIN] Invalid password for:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ [LOGIN] Password verified');

    // Generate 7-day auth token
    const authToken = generateAuthToken(user.id, user.email);
    console.log('✅ [LOGIN] Generated 7-day auth token');
    console.log('✅ [LOGIN] User logged in successfully:', { id: user.id, email: user.email });

    return NextResponse.json(
      {
        message: 'Login successful',
        token: authToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [LOGIN] Unexpected error:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
