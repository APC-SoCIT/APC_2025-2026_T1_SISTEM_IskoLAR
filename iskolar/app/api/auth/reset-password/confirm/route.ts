import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validatePassword } from '@/lib/utils/password-validation';
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
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Validate the reset token
    const tokenData = await validateResetToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Handle password update based on user type
    if (tokenData.userType === 'user') {
      // Update password in users table directly (no hashing for now)
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: password })
        .eq('user_id', tokenData.userId);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update password' },
          { status: 400 }
        );
      }
    } else {
      // For scholars, use Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    // Mark the token as used regardless of user type
    await markTokenAsUsed(token);

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}