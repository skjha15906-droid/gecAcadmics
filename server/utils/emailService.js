const nodemailer = require('nodemailer');

const RECIPIENT_EMAIL = 'jhashubh31@gmail.com';

/**
 * Sends an email notification to Shubh Kumar Jha when a contact form is submitted.
 * Falls back gracefully to database storage if SMTP credentials are not configured.
 */
async function sendContactNotification({ name, email, subject, message }) {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!smtpUser || !smtpPass) {
    console.log(`ℹ️ [Email Service] In-portal message from ${name} (${email}) saved to database.`);
    console.log(`ℹ️ [Email Service] (Optional) Set SMTP_USER and SMTP_PASS in .env to auto-forward directly to ${RECIPIENT_EMAIL}`);
    return { forwarded: false, reason: 'SMTP credentials not configured in .env' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"GECWC Academic Portal" <${smtpUser}>`,
      to: RECIPIENT_EMAIL,
      replyTo: `${name} <${email}>`,
      subject: `[GECWC Portal Inquiry] ${subject} - from ${name}`,
      text: `New Student / Faculty Inquiry from GECWC Academics Portal\n\n` +
        `Sender Name: ${name}\n` +
        `Sender Email: ${email}\n` +
        `Subject: ${subject}\n\n` +
        `Message Content:\n` +
        `${message}\n\n` +
        `---\n` +
        `Reply directly to this email to respond to ${name} (${email}).`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background: #ffffff;">
          <div style="background: #1e1b4b; color: #ffffff; padding: 16px 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 18px; color: #fbbf24;">GECWC Academics Portal</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">New In-Portal Inquiry for Administrator Shubh Kumar Jha</p>
          </div>
          <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; margin-bottom: 16px;"><strong>A new inquiry has been submitted through the Contact Us page:</strong></p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">From:</td>
                <td style="padding: 8px 0; color: #0f172a;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email Address:</td>
                <td style="padding: 8px 0; color: #2563eb;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Subject / Topic:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${subject}</td>
              </tr>
            </table>

            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 4px; margin-bottom: 20px;">
              <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Message:</div>
              <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            </div>

            <p style="font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; pt-4; margin-top: 20px;">
              💡 You can simply hit <strong>Reply</strong> to email ${name} back directly.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Successfully forwarded message to ${RECIPIENT_EMAIL}. Message ID: ${info.messageId}`);
    return { forwarded: true, messageId: info.messageId };
  } catch (error) {
    console.error(`⚠️ [Email Service] Forwarding failed:`, error.message);
    return { forwarded: false, error: error.message };
  }
}

module.exports = {
  sendContactNotification,
  RECIPIENT_EMAIL
};
