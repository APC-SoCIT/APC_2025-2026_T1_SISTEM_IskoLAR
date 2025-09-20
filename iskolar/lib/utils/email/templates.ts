interface TemplateData {
  resetLink: string;
  userType: 'admin' | 'scholar';
}

export function getPasswordResetEmailTemplate({ resetLink, userType }: TemplateData): { subject: string; text: string; html: string } {
  const appName = 'IskoLAR';
  const subject = 'Password Reset - IskoLAR';

  const text = `Hello ${userType === 'admin' ? 'Administrator' : 'Scholar'},

You recently requested to reset your password for your ${appName} account.

To reset your password, please visit this link:
${resetLink}

This password reset link will expire in 24 hours.

If you did not request a password reset, you can safely ignore this email.

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
    <p>Hello ${userType === 'admin' ? 'Administrator' : 'Scholar'},</p>
    <p>A password reset was requested for your ${appName} account. Please click the button below to set a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="background-color: #D32F2F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color: #666; font-size: 14px;">If you can't click the button, copy and paste this link:</p>
    <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
    <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px;">If you didn't request this password reset, you can safely ignore this email.</p>
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