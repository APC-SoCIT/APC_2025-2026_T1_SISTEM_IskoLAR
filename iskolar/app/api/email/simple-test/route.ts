import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

export async function GET() {
  try {
    // Initialize SendGrid
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not set');
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Simple test message
    const msg = {
      to: 'iberson0966@gmail.com',
      from: {
        email: 'ibersonmarinas@gmail.com',
        name: 'IskoLAR Support'
      },
      subject: 'Simple Test Email',
      text: 'This is a test email to verify SendGrid delivery.',
      html: '<p>This is a test email to verify SendGrid delivery.</p>',
    };

    // Send the test email
    const result = await sgMail.send(msg);

    return NextResponse.json({
      success: true,
      status: result[0]?.statusCode,
      messageId: result[0]?.headers['x-message-id']
    });
  } catch (error: any) {
    console.error('Test email error:', {
      message: error.message,
      response: error.response?.body
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.body
    }, { status: 500 });
  }
}