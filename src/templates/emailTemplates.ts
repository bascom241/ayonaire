export const sendInviteEmail = (email: string, inviteLink: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f7fb; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" align="center" bgcolor="#f4f7fb">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- Card -->
        <table width="100%" style="max-width:480px; background:#ffffff; border-radius:16px; padding:30px; box-shadow:0 10px 25px rgba(0,0,0,0.05);">

          <!-- Title -->
          <tr>
            <td align="center">
              <h2 style="margin:0; color:#222;">You're Invited 🎉</h2>
              <p style="color:#666; font-size:14px;">
                Join your learning platform
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-top:20px;">
              <p style="font-size:15px; color:#333;">
                Hi <strong>${email}</strong>,
              </p>
              <p style="font-size:14px; color:#555;">
                You've been invited to join a course on our platform. Click the button below to set up your account and get started.
              </p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding:25px 0;">
              <a href="${inviteLink}" style="
                background:#1a73e8;
                color:#ffffff;
                text-decoration:none;
                padding:14px 28px;
                font-size:14px;
                border-radius:8px;
                display:inline-block;
                font-weight:bold;
              ">
                Accept Invitation
              </a>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td>
              <p style="font-size:13px; color:#777;">
                This invitation will expire in <strong>24 hours</strong>.
              </p>
              <p style="font-size:13px; color:#999;">
                If you weren’t expecting this invite, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <p style="font-size:12px; color:#aaa; margin-top:20px;">
          This is an automated message, please do not reply.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>
`;

export const getAnnouncementEmailHTML = (title: string, summary: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f7fb; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" align="center" bgcolor="#f4f7fb">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- Card -->
        <table width="100%" style="max-width:480px; background:#ffffff; border-radius:16px; padding:30px; box-shadow:0 10px 25px rgba(0,0,0,0.05);">

          <!-- Title -->
          <tr>
            <td align="center">
              <h2 style="margin:0; color:#222;">📢 ${title}</h2>
              <div style="height:2px; width:50px; background:#1a73e8; margin:15px auto;"></div>
             </td>
           </tr>

          <!-- Content -->
          <tr>
            <td style="padding-top:10px;">
              <div style="font-size:15px; color:#333; line-height:1.6;">
                ${summary}
              </div>
             </td>
           </tr>

          <!-- Footer Note -->
          <tr>
            <td style="padding-top:20px;">
              <p style="font-size:12px; color:#999; border-top:1px solid #eee; padding-top:20px; margin-top:10px;">
                This is an announcement from your course instructor.
              </p>
             </td>
           </tr>

         </table>

        <!-- Footer -->
        <p style="font-size:12px; color:#aaa; margin-top:20px;">
          This is an automated message, please do not reply.
        </p>

       </td>
     </tr>
   </table>
</body>
</html>
`;

export const getEmailVerificationHTML = (
  name: string,
  verificationToken: string,
) => `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0; padding:0; background:#f4f7fb; font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f7fb">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" style="max-width:480px; background:#ffffff; border-radius:12px; padding:30px;">
          <tr>
            <td>
              <h2 style="margin:0 0 12px; color:#222;">Verify your email</h2>

              <p style="font-size:14px; color:#555;">
                Hi ${name}, please use the verification code below to activate your account.
              </p>

              <div style="
                text-align:center;
                font-size:28px;
                font-weight:bold;
                letter-spacing:6px;
                padding:20px;
                background:#f1f3f5;
                border-radius:8px;
                margin:20px 0;
              ">
                ${verificationToken}
              </div>

              <p style="font-size:13px; color:#777;">
                This code expires in 24 hours.
              </p>

              <p style="font-size:12px; color:#999;">
                If you did not create this account, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
export const getPasswordResetHTML = (name: string, resetLink: string) => `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0; padding:0; background:#f4f7fb; font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f7fb">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" style="max-width:480px; background:#ffffff; border-radius:12px; padding:30px;">
          <tr>
            <td>
              <h2 style="margin:0 0 12px; color:#222;">Reset your password</h2>
              <p style="font-size:14px; color:#555;">Hi ${name}, use the button below to set a new password.</p>
              <p style="text-align:center; padding:20px 0;">
                <a href="${resetLink}" style="background:#1a73e8; color:#fff; text-decoration:none; padding:13px 24px; border-radius:8px; display:inline-block;">Reset Password</a>
              </p>
              <p style="font-size:13px; color:#777;">This link expires in 1 hour.</p>
              <p style="font-size:12px; color:#999;">If you did not request a password reset, you can ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
