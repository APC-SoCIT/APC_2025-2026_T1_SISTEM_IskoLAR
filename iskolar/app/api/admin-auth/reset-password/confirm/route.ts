import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { validateResetToken, markTokenAsUsed } from '@/lib/utils/tokens';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one special character' },
        { status: 400 }
      );
    }

    // Log the token being validated
    console.log('Validating token:', token);

    // Validate the token first
    const validToken = await validateResetToken(token);
    console.log('Token validation result:', validToken);
    
    if (!validToken) {
      return NextResponse.json({
        error: 'Invalid or expired reset token'
      }, { status: 400 });
    }

    // Create supabase admin client for privileged operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Attempting to update password for admin_id:', validToken.userId);

    // First verify if the admin exists
    const { data: adminData, error: adminCheckError } = await supabase
      .from('admin')
      .select('admin_id')
      .eq('admin_id', validToken.userId)
      .single();

    if (adminCheckError || !adminData) {
      console.error('Admin not found:', adminCheckError);
      return NextResponse.json({ 
        error: 'Admin account not found'
      }, { status: 404 });
    }

    // Update admin's password in database without hashing
    const { data: updateData, error: updateError } = await supabase
      .from('admin')
      .update({ 
        password: password // Store plain password for now
      })
      .eq('admin_id', validToken.userId)
      .select();

    if (updateError) {
      console.error('Password update error:', updateError);
      console.error('Update error details:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      return NextResponse.json({ 
        error: 'Failed to update password: ' + updateError.message
      }, { status: 400 });
    }

    console.log('Password updated successfully for admin_id:', validToken.userId);

    // Mark the token as used
    try {
      await markTokenAsUsed(token);
      console.log('Token marked as used successfully');
    } catch (markError) {
      console.error('Error marking token as used:', markError);
      // Continue since password was updated successfully
    }

    return NextResponse.json({ 
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update password' },
      { status: 500 }
    );
  }
}