import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/jwt';
import { sendVerificationEmail } from '@/lib/email';
import { validateEmail, validatePhone, validateName } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();
    console.log('📝 [REGISTER] Received request:', { name, email, phone: '***', hasPassword: !!password });

    // Validation
    if (!validateName(name)) {
      console.warn('❌ [REGISTER] Invalid name:', name);
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      console.warn('❌ [REGISTER] Invalid email:', email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!validatePhone(phone)) {
      console.warn('❌ [REGISTER] Invalid phone:', phone);
      return NextResponse.json(
        { error: 'Phone must be 10 digits' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      console.warn('❌ [REGISTER] Invalid password: too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.warn('❌ [REGISTER] User already exists:', email);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user as unverified
    const hashedPhone = await bcryptjs.hash(phone, 10);
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log('🔐 [REGISTER] Phone and password hashed');
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        phone: hashedPhone,
        password: hashedPassword,
        is_verified: false,
      })
      .select()
      .single();

    if (createError || !newUser) {
      console.error('❌ [REGISTER] Failed to create user:', createError?.message);
      
      // Detailed error messages
      if (createError?.message?.includes('password')) {
        return NextResponse.json(
          { 
            error: 'Database error: Password field issue. Please contact support.',
            details: 'Missing password column in users table'
          },
          { status: 500 }
        );
      }
      
      if (createError?.message?.includes('users')) {
        return NextResponse.json(
          { 
            error: 'Database error: Users table not found. Please check Supabase setup.',
            details: createError.message
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create user',
          details: createError?.message || 'Unknown database error'
        },
        { status: 500 }
      );
    }

    // Generate 15-minute verification token
    const verificationToken = generateToken(newUser.id, email, '15m');
    console.log('✅ [REGISTER] User created:', { id: newUser.id, email, verified: newUser.is_verified });
    console.log('📧 [REGISTER] Verification token generated for', email);

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_API_URL}/auth/verify?token=${verificationToken}`;
    await sendVerificationEmail(email, name, verificationLink);
    console.log('📨 [REGISTER] Verification email sent to', email);

    return NextResponse.json(
      {
        message: 'User registered successfully. Check your email to verify.',
        userId: newUser.id,
        token: verificationToken,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [REGISTER] Error:', errorMessage);
    
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
