import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    console.log('📧 [VERIFY-API] Email verification request received. Token:', token ? 'present' : 'MISSING');

    if (!token) {
      console.warn('⚠️ [VERIFY-API] No token provided in URL');
      return NextResponse.json(
        { error: 'No verification token provided' },
        { status: 400 }
      );
    }

    // Verify and decode token
    console.log('🔐 [VERIFY-API] Verifying token...');
    const payload = verifyToken(token);
    
    if (!payload) {
      console.error('❌ [VERIFY-API] Token verification failed - token expired or invalid');
      return NextResponse.json(
        { error: 'Token has expired or is invalid' },
        { status: 401 }
      );
    }

    console.log('✅ [VERIFY-API] Token decoded successfully for user ID:', payload.userId);

    // Check if user exists
    console.log('🔍 [VERIFY-API] Checking if user exists...');
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, is_verified')
      .eq('id', payload.userId)
      .single();

    if (fetchError || !existingUser) {
      console.error('❌ [VERIFY-API] User not found in database:', payload.userId);
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    console.log('✅ [VERIFY-API] User found:', existingUser.email);
    console.log('📊 [VERIFY-API] Current verification status:', existingUser.is_verified);

    // If already verified, no need to update
    if (existingUser.is_verified) {
      console.log('ℹ️ [VERIFY-API] User already verified');
      return NextResponse.json(
        { message: 'Email already verified', email: existingUser.email },
        { status: 200 }
      );
    }

    // Update is_verified to true
    console.log('🔄 [VERIFY-API] Updating is_verified to true...');
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', payload.userId)
      .select('id, email, is_verified')
      .single();

    if (updateError) {
      console.error('❌ [VERIFY-API] Failed to update database:', updateError.message);
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      console.error('❌ [VERIFY-API] User not found after update');
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    console.log('✅ [VERIFY-API] User marked as verified:', updatedUser.email);
    console.log('✅ [VERIFY-API] Email verification complete!');

    return NextResponse.json(
      {
        message: 'Email verified successfully!',
        email: updatedUser.email,
        verified: updatedUser.is_verified,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [VERIFY-API] Unexpected error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
