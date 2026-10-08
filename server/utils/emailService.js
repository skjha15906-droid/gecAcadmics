const nodemailer = require('nodemailer');

const RECIPIENT_EMAIL = 'jhashubh31@gmail.com';

/**
 * Sends an email notification to Shubh Kumar Jha when a contact form is submitted.
 * 1. Uses SMTP credentials if configured in .env.
 * 2. Uses FormSubmit HTTP cloud API as automated email forwarder directly to jhashubh31@gmail.com.
 * 3. Always preserves the message safely in the SQLite database and Admin Panel.
 */
async function sendContactNotification({ name, email, subject, message }) {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  // 1. If SMTP is configured, send via Nodemailer
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
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
          `Message Content:\n${message}\n\n` +
          `Reply directly to this email to respond to ${name} (${email}).`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: #1e1b4b; color: #ffffff; padding: 16px 20px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0; font-size: 18px; color: #fbbf24;">GECWC Academics Portal</h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">New In-Portal Inquiry for Administrator Shubh Kumar Jha</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">From:</td><td style="padding: 8px 0; color: #0f172a;">${name}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Email Address:</td><td style="padding: 8px 0; color: #2563eb;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Subject / Topic:</td><td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${subject}</td></tr>
              </table>
              <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 4px; margin-bottom: 20px;">
                <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Message:</div>
                <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${message}</div>
              </div>
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [Email Service] Forwarded message via SMTP to ${RECIPIENT_EMAIL}. Message ID: ${info.messageId}`);
      return { forwarded: true, method: 'smtp' };
    } catch (err) {
      console.error('⚠️ [Email Service] SMTP send failed, trying cloud forwarder:', err.message);
    }
  }

  // 2. Cloud Forwarder via FormSubmit directly to jhashubh31@gmail.com
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'http://localhost:5000',
        'Referer': 'http://localhost:5000/'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        _subject: `[GECWC Academics] ${subject} - from ${name}`,
        message: message,
        _replyto: email,
        _template: 'table'
      })
    });

    const data = await res.json();
    console.log(`📡 [Email Service] Cloud email delivery status:`, data);
    return { forwarded: true, method: 'cloud', data };
  } catch (err) {
    console.error(`⚠️ [Email Service] Cloud forwarder error:`, err.message);
    return { forwarded: false, error: err.message };
  }
}

/**
 * Sends an email directly to the student when an administrator replies to their inquiry.
 */
async function sendAdminReplyToStudent({ studentEmail, studentName, originalSubject, originalMessage, replyMessage, adminName }) {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
      });

      const mailOptions = {
        from: `"GECWC Academics Admin" <${smtpUser}>`,
        to: studentEmail,
        replyTo: smtpUser,
        subject: `Re: ${originalSubject} - GECWC Academics Response`,
        text: `Dear ${studentName},\n\n` +
          `${replyMessage}\n\n` +
          `-----------------------------------------\n` +
          `Your Original Inquiry: "${originalMessage}"\n` +
          `Portal: GECWC Academics (Government Engineering College, West Champaran)`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: #1e1b4b; color: #ffffff; padding: 16px 20px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0; font-size: 18px; color: #fbbf24;">GECWC Academics Portal</h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">Official Response from Administrator ${adminName || 'Shubh Kumar Jha'}</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 14px; color: #334155; margin-top: 0;">Dear <strong>${studentName}</strong>,</p>
              <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 16px; border-radius: 4px; margin: 16px 0;">
                <div style="font-size: 12px; font-weight: bold; color: #15803d; text-transform: uppercase; margin-bottom: 6px;">Administrator Response:</div>
                <div style="font-size: 14px; color: #0f172a; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</div>
              </div>
              <div style="background: #f8fafc; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #64748b; margin-top: 20px;">
                <strong>Original Topic:</strong> ${originalSubject}<br/>
                <strong>Your Message:</strong> <em>"${originalMessage}"</em>
              </div>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">
                Government Engineering College, West Champaran (GECWC) • Department of Computer Science & Engineering
              </p>
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [Email Service] Admin reply sent via SMTP to ${studentEmail}. ID: ${info.messageId}`);
      return { sent: true, method: 'smtp' };
    } catch (err) {
      console.error('⚠️ [Email Service] SMTP reply send failed:', err.message);
      return { sent: false, error: err.message };
    }
  }

  return { sent: false, reason: 'No SMTP credentials configured in .env' };
}

module.exports = {
  sendContactNotification,
  sendAdminReplyToStudent,
  RECIPIENT_EMAIL
};

