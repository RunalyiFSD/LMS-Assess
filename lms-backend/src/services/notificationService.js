const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.initEmail();
  }

  async initEmail() {
    try {
      // Create a test account on Ethereal Email for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      console.log('📧 Ethereal Email initialized for notifications');
    } catch (err) {
      console.error('Failed to initialize Ethereal Email', err);
    }
  }

  async sendEmail(toEmail, subject, text) {
    if (!this.transporter) return;
    try {
      const info = await this.transporter.sendMail({
        from: '"LMS Assess" <noreply@lmsassess.com>',
        to: toEmail,
        subject: subject,
        text: text,
      });
      console.log('📧 Email sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (err) {
      console.error('Email send failed:', err);
    }
  }

  async getUserNotifications(userId) {
    return await notificationRepository.getUserNotifications(userId);
  }

  async markAsRead(notificationId, userId) {
    return await notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  }

  /**
   * Creates an in-app notification and optionally fires off an email.
   */
  async createNotification(userId, type, message, link) {
    // 1. Create In-App Notification
    const notification = await notificationRepository.createNotification({
      user_id: userId,
      type,
      message,
      link,
      is_read: false
    });

    // 2. Dispatch Email (Fire & Forget)
    try {
      const user = await userRepository.findById(userId);
      if (user && user.email) {
        let subject = "LMS Notification";
        if (type === 'assessment_due') subject = "Assessment Due Reminder";
        if (type === 'grade_published') subject = "New Grade Published";
        
        await this.sendEmail(user.email, subject, message + (link ? `\n\nView here: http://localhost:5173${link}` : ''));
      }
    } catch (err) {
      console.error('Failed to dispatch notification email:', err);
    }

    return notification;
  }
}

module.exports = new NotificationService();
