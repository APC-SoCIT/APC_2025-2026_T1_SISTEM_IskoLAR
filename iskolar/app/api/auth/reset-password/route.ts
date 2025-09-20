import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/utils/email/sendEmail';
import { getPasswordResetEmailTemplate } from '@/lib/utils/email/templates';
import { createResetToken } from '@/lib/utils/tokens';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('role', 'scholar')
      .single();

    // Always return the same message for security
    const response = {
      message: 'If an account exists with this email, a password reset link will be sent.'
    };

    // If user doesn't exist, return generic message
    if (userError || !user) {
      return NextResponse.json(response);
    }

    // Generate reset token
    const token = await createResetToken({
      userId: user.id,
      userType: 'scholar'
    });

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`;

    // Get email template
    const template = getPasswordResetEmailTemplate({
      resetLink,
      userType: 'scholar'
    });

    // Send email
    await sendEmail({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link will be sent.' },
      { status: 200 }
    );
  }
}