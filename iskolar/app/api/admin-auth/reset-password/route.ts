import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/utils/email/sendEmail';
import { getPasswordResetEmailTemplate } from '@/lib/utils/email/templates';
import { createResetToken } from '@/lib/utils/tokens';

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not set');
    }
    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM is not set');
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL is not set');
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create Supabase client
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

    console.log('Checking if admin user exists:', email);
    
    // Check if user exists using the admin client
    const { data: user, error: userError } = await supabase
      .from('admin')
      .select('admin_id, email_address')
      .eq('email_address', email)
      .single();

    console.log('Admin query result:', { user, error: userError?.message });

    // Always return the same message for security
    const response = {
      message: 'If an account exists with this email, a password reset link will be sent.'
    };

    // If user doesn't exist, return generic message
    if (userError || !user) {
      console.log('User not found or error occurred');
      return NextResponse.json(response);
    }

    console.log('User found, initiating password reset');

    console.log('User found, generating reset token');
    
    // Generate reset token using admin_id
    const token = await createResetToken({
      userId: user.admin_id,
      userType: 'admin'
    });

    console.log('Reset token generated successfully');

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin-auth/reset-password/${token}`;
    console.log('Reset link generated:', resetLink);

    // Get email template
    const template = getPasswordResetEmailTemplate({
      resetLink,
      userType: 'admin'
    });
    
    console.log('Email template generated successfully');

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html
      });
      console.log('Reset password email sent successfully');
    } catch (emailError: any) {
      console.error('Failed to send reset password email:', emailError);
      if (emailError.response) {
        console.error('SendGrid API Response:', emailError.response.body);
      }
      // Still return success message for security
      return NextResponse.json(response);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link will be sent.' },
      { status: 200 }
    );
  }
}