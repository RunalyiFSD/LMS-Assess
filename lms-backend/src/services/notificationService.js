const Notification = require('../legacy/models/Notification');
const nodemailer = require('nodemailer');

// Set up standard SMTP configuration transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass',
  },
});

/**
 * Creates an in-app notification and dispatches an email alert.
 * @param {string} recipientId - User ID of the recipient
 * @param {string} title - Notification title
 * @param {string} message - Notification text
 * @param {string} type - 'assessment_assigned' | 'result_published' | 'notification'
 * @param {string} recipientEmail - Email address of the recipient
 * @returns {Promise<Object>} The saved notification document
 */
exports.createNotification = async (recipientId, title, message, type = 'notification', recipientEmail = null) => {
  try {
    // 1. Save alert into notifications collection
    const notification = new Notification({
      recipient: recipientId,
      title,
      message,
      type,
    });
    await notification.save();

    // 2. Dispatch email if email address is provided
    if (recipientEmail) {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@lmsassessment.com',
        to: recipientEmail,
        subject: `[LMS Assessment] - ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">LMS Assessment Alert</h2>
            <p style="font-size: 16px; color: #1e293b; font-weight: bold;">${title}</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">${message}</p>
            <div style="margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
              This is an automated notification. Please do not reply directly to this email.
            </div>
          </div>
        `,
      };

      // Attempt to send email, log failure instead of breaking request thread
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.warn(`[Mail Dispatch Warning] Failed to send email to ${recipientEmail}: ${error.message}`);
          console.log(`[Mail Mock Log] Email body: To: ${recipientEmail} | Subject: ${title} | Content: ${message}`);
        } else {
          console.log(`[Mail Dispatch Success] Email sent: ${info.messageId}`);
        }
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
