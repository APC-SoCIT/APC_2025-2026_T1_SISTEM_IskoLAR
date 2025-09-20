import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/utils/email/sendEmail';

export async function GET(request: Request) {
  try {
    const result = await sendEmail({
      to: 'iberson0966@gmail.com',
      subject: 'Test Email from IskoLAR',
      text: 'This is a test email to verify SendGrid configuration.',
      html: '<p>This is a test email to verify SendGrid configuration.</p>'
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error.response?.body 
    }, { status: 500 });
  }
}