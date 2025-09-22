import { createClient } from '@supabase/supabase-js';
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

    // Create a new supabase client without auth context for this operation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('Searching for user with email:', email); // Debug log

    // Define role IDs
    const ROLE_IDS = {
      SUPER_ADMIN: 'ebfbc2ad-e3e6-43c2-bae8-f54637964b37',
      USER: 'e41c5181-6733-4bc6-ad1d-5da075dd68d4',
      FINANCE: 'cc52e911-277e-480e-871d-645fd9696f5a',
      REVIEWER: '9ac35812-cc11-4594-be4a-473b88353d1d'
    };

    // First, let's check all users to debug
    const { data: allUsers, error: listError } = await supabase
      .from('users')
      .select('user_id, email_address, role_id');
    
    console.log('All users in database:', allUsers);
    
    // Now check for our specific user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id, email_address, role_id')
      .ilike('email_address', email) // Case-insensitive match
      .single();
      
    console.log('Database query result:', { 
      searchedEmail: email,
      user,
      error: userError
    }); // Debug log

    // Always return the same message for security
    const response = {
      message: 'If an account exists with this email, a password reset link will be sent.'
    };

    // If no user exists, return generic message
    if (userError || !user) {
      console.log('No user found for email:', email);  // For debugging
      return NextResponse.json(response);
    }

    // Determine which type of user we're dealing with
    let userType: 'admin' | 'user' | 'finance' | 'reviewer';
    const userId = user.user_id;
    const userEmail = user.email_address;

    // Map role directly from role_id without querying the role table
    switch (user.role_id) {
      case ROLE_IDS.SUPER_ADMIN:
        userType = 'admin';
        break;
      case ROLE_IDS.FINANCE:
        userType = 'finance';
        break;
      case ROLE_IDS.REVIEWER:
        userType = 'reviewer';
        break;
      case ROLE_IDS.USER:
      default:
        userType = 'user';
        break;
    }

    console.log('Mapped user type:', { roleId: user.role_id, userType }); // Debug log

    // Map role ID to userType
    switch (user.role_id) {
      case ROLE_IDS.SUPER_ADMIN:
        userType = 'admin';
        break;
      case ROLE_IDS.FINANCE:
        userType = 'finance';
        break;
      case ROLE_IDS.REVIEWER:
        userType = 'reviewer';
        break;
      case ROLE_IDS.USER:
      default:
        userType = 'user';
        break;
    }
    
    console.log('Mapped user type:', { roleId: user.role_id, userType }); // Debug log

    console.log('Found user:', {
      email: userEmail,
      roleId: user.role_id,
      userType
    });

    // Log for debugging
    console.log('Processing reset for:', {
      userType,
      userId,
      userEmail
    });

    // Generate reset token
    const token = await createResetToken({
      userId,
      userType
    });

    // Create reset link with the appropriate path based on user type
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}${
      userType === 'admin' ? '/admin-auth' : '/auth'
    }/reset-password/${token}`;

    // Get email template with correct user type
    const template = getPasswordResetEmailTemplate({
      resetLink,
      userType
    });

    // Send email
    const emailResult = await sendEmail({
      to: userEmail,
      subject: template.subject,
      text: template.text,
      html: template.html
    });

    // Log result for debugging
    if (emailResult.success) {
      console.log('Reset email sent successfully to:', userEmail);
    } else {
      console.error('Failed to send reset email:', {
        email: userEmail,
        error: emailResult.error
      });
      // Still return success to user for security
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