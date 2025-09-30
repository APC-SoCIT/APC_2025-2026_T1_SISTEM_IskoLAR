interface EmailTemplate {
  resetLink: string;
  userType: 'admin' | 'user' | 'finance' | 'reviewer';
}

export function getPasswordResetEmailTemplate({ resetLink, userType }: EmailTemplate): { subject: string; text: string; html: string } {
  const appName = 'IskoLAR';
  
  const subject = userType === 'admin' 
    ? 'Administrator Password Reset - IskoLAR' 
    : 'Password Reset - IskoLAR';

  const getSalutation = (): string => {
    switch (userType) {
      case 'admin':
        return 'Administrator';
      case 'finance':
        return 'Finance Officer';
      case 'reviewer':
        return 'Reviewer';
      default:
        return 'Valued User';
    }
  };

  const getCustomMessage = (): string => {
    switch (userType) {
      case 'admin':
        return 'As an administrator of IskoLAR, your account security is crucial. You have requested to reset your password.';
      case 'finance':
        return 'As a finance officer of IskoLAR, you have requested to reset your password.';
      case 'reviewer':
        return 'As a reviewer for IskoLAR, you have requested to reset your password.';
      case 'user':
      default:
        return 'You have requested to reset your password for your account.';
    }
  };

  const text = `Hello ${getSalutation()},

${getCustomMessage()}

To reset your password, please visit this link:
${resetLink}

This password reset link will expire in 72 hours (3 days).

For security reasons, if you did not request this password reset, please contact support immediately.

Best regards,
The ${appName} Team
APC Support`.trim();

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${appName} Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #D32F2F;">${appName} Password Reset</h1>
  </div>
  <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p>Hello ${getSalutation()},</p>
    
    ${userType === 'admin' 
      ? `<p><strong>As an administrator of ${appName}, your account security is crucial.</strong></p>` 
      : userType === 'finance' 
      ? `<p><strong>As a finance officer of ${appName}, your account security is important.</strong></p>`
      : userType === 'reviewer'
      ? `<p><strong>As a reviewer for ${appName}, your account security is important.</strong></p>`
      : ''}
    
    <p>${getCustomMessage()}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="background-color: #D32F2F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">If you cannot click the button, copy and paste this link:</p>
    <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
    <p style="color: #666; font-size: 14px;">This link will expire in 72 hours (3 days).</p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    
    ${userType === 'admin'
      ? '<p style="color: #D32F2F; font-weight: bold;">For security reasons, if you did not request this password reset, please contact IT support immediately.</p>'
      : '<p style="color: #999; font-size: 12px;">If you did not request this password reset, you can safely ignore this email.</p>'
    }
  </div>
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>IskoLAR Support Team</p>
  </div>
</body>
</html>`.trim();

  return {
    subject,
    text,
    html
  };
}