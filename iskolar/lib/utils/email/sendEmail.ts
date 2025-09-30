import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is not set');
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface SendGridResponse {
  success: boolean;
  response?: any;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export async function sendEmail({ to, subject, text, html }: EmailOptions): Promise<SendGridResponse> {
  try {
    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM environment variable is not set');
    }

    const fromEmail = process.env.EMAIL_FROM;
    const msg = {
      to,
      from: {
        email: fromEmail,
        name: 'IskoLAR Support'
      },
      subject,
      text: text || '',
      html: html || '',
      mail_settings: {
        sandbox_mode: {
          enable: false
        }
      }
    };

    const result = await sgMail.send(msg);
    return { success: true, response: result[0] };
  } catch (error: any) {
    console.error('SendGrid Error:', {
      error: error.message,
      response: error.response?.body,
      code: error.code
    });
    
    const errorMessage = error.response?.body?.errors?.[0]?.message || error.message;
    return { 
      success: false, 
      error: {
        message: errorMessage,
        code: error.code,
        details: error.response?.body
      }
    };
  }
}
