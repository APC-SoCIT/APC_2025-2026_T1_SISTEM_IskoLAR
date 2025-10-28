
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSuperAdmin } from '@/lib/auth/roles';
import sgMail from '@sendgrid/mail';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to get user from Authorization header
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const accessToken = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

// POST /api/admin/settings/test-email - Send test email
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    const isSuperAdminUser = await isSuperAdmin(user.email);
    if (!isSuperAdminUser) {
      return NextResponse.json(
        { error: 'Only super administrators can send test emails' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { recipientEmail } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'recipientEmail is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if SendGrid API key is configured
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: 'SendGrid API key not configured. Please set SENDGRID_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Check if EMAIL_FROM is configured
    if (!process.env.EMAIL_FROM) {
      return NextResponse.json(
        { error: 'EMAIL_FROM environment variable not configured.' },
        { status: 500 }
      );
    }

    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Send test email using environment variable for FROM address
    const msg = {
      to: recipientEmail,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'IskoLAR Support'
      },
      subject: 'IskoLAR Test Email',
      text: `This is a test email from IskoLAR Scholarship System.\n\nSent by: ${user.email}\nSent at: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}\n\nIf you received this email, your email configuration is working correctly.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a56db;">IskoLAR Test Email</h2>
          <p>This is a test email from IskoLAR Scholarship System.</p>
          <p><strong>Sent by:</strong> ${user.email}</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</p>
          <p style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #22c55e;">
            ✓ If you received this email, your email configuration is working correctly.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${recipientEmail}`
    });
  } catch (error: unknown) {
    console.error('[POST /api/admin/settings/test-email] Error:', error);
    
    // SendGrid-specific error handling
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const err = error as { response?: { body?: unknown }, message?: string };
      return NextResponse.json(
        { 
          error: 'SendGrid error',
          details: err.response?.body || err.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}
