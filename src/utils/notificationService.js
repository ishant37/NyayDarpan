// Notification Service for FRA Patta Generator
// This service handles email notifications throughout the application

// Email notification service
export const NotificationService = {
  // Get settings from localStorage
  getSettings() {
    try {
      const savedSettings = localStorage.getItem('fraPattaSettings');
      return savedSettings ? JSON.parse(savedSettings) : null;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  },

  // Check if email notifications are enabled
  isEmailEnabled() {
    const settings = this.getSettings();
    return settings?.emailNotifications?.enabled && settings?.emailNotifications?.email;
  },

  // Send email notification (simulated)
  async sendEmail(to, subject, message, type = 'info') {
    try {
      console.log('📧 Email Notification:', {
        to,
        subject,
        message,
        type,
        timestamp: new Date().toISOString()
      });

      // In a real application, integrate with:
      // 1. EmailJS (client-side) - https://www.emailjs.com/
      // 2. SendGrid (backend) - https://sendgrid.com/
      // 3. AWS SES (backend) - https://aws.amazon.com/ses/
      // 4. Nodemailer (backend) - https://nodemailer.com/

      /* Example EmailJS integration:
      
      import emailjs from 'emailjs-com';
      
      const templateParams = {
        to_email: to,
        subject: subject,
        message: message,
        from_name: 'FRA Patta Generator'
      };

      const result = await emailjs.send(
        'service_your_service_id',
        'template_your_template_id',
        templateParams,
        'your_public_key'
      );
      
      return { success: true, result };
      */

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { 
        success: true, 
        message: 'Email sent successfully (simulated)',
        emailSent: true 
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { 
        success: false, 
        message: 'Failed to send email',
        error: error.message 
      };
    }
  },

  // Send PDF generation success notification
  async notifyPDFGenerated(pattaData) {
    if (!this.isEmailEnabled()) {
      return { success: false, message: 'Email notifications not enabled' };
    }

    const settings = this.getSettings();
    const emailTypes = settings.emailNotifications.types || [];
    
    if (!emailTypes.includes('pdfGenerated')) {
      return { success: false, message: 'PDF notifications not enabled' };
    }

    const subject = '📄 FRA Patta PDF Generated Successfully';
    const message = `Dear User,

Your FRA Patta certificate has been generated successfully!

📋 Certificate Details:
• Patta ID: ${pattaData.id}
• Holder Name: ${pattaData.HOLDER_NAME}
• Father's Name: ${pattaData.FATHER_NAME}
• District: ${pattaData.DISTRICT}
• Tehsil: ${pattaData.TEHSIL}
• Khasra Number: ${pattaData.KHASRA_NO}
• Total Area: ${pattaData.TOTAL_AREA_SQFT} sq. ft.
• Generated: ${new Date().toLocaleString('en-IN')}

✅ Status: PDF Ready for Download
🔐 Security: QR Code verification included
📱 Mobile: Scan QR code to verify authenticity

The PDF certificate has been successfully downloaded to your device and is ready for official use.

Important Notes:
• This certificate is digitally signed and QR verified
• Keep multiple copies for your records
• Contact local FRA office for any queries

This is an automated notification from FRA Patta Generator.
Please do not reply to this email.

Best regards,
Forest Rights Act - Digital Certificate Team
Ministry of Environment, Forest and Climate Change
Government of India`;

    return await this.sendEmail(
      settings.emailNotifications.email,
      subject,
      message,
      'success'
    );
  },

  // Send system alert notification
  async notifySystemAlert(alertType, alertMessage) {
    if (!this.isEmailEnabled()) {
      return { success: false, message: 'Email notifications not enabled' };
    }

    const settings = this.getSettings();
    const emailTypes = settings.emailNotifications.types || [];
    
    if (!emailTypes.includes('systemAlerts')) {
      return { success: false, message: 'System alert notifications not enabled' };
    }

    const subject = `🚨 FRA Patta System Alert: ${alertType}`;
    const message = `Dear User,

System Alert Notification

⚠️ Alert Type: ${alertType}
📝 Message: ${alertMessage}
🕐 Time: ${new Date().toLocaleString('en-IN')}

Please check your FRA Patta Generator dashboard for more details or contact support if you need assistance.

This is an automated system notification.

Best regards,
FRA Patta Generator System
Technical Support Team`;

    return await this.sendEmail(
      settings.emailNotifications.email,
      subject,
      message,
      'warning'
    );
  },

  // Send status update notification
  async notifyStatusUpdate(updateType, updateMessage) {
    if (!this.isEmailEnabled()) {
      return { success: false, message: 'Email notifications not enabled' };
    }

    const settings = this.getSettings();
    const emailTypes = settings.emailNotifications.types || [];
    
    if (!emailTypes.includes('statusUpdates')) {
      return { success: false, message: 'Status update notifications not enabled' };
    }

    const subject = `📊 FRA Patta Status Update: ${updateType}`;
    const message = `Dear User,

Status Update Notification

📋 Update Type: ${updateType}
📝 Details: ${updateMessage}
🕐 Updated: ${new Date().toLocaleString('en-IN')}

You can view detailed status information in your FRA Patta Generator dashboard.

This is an automated status notification.

Best regards,
FRA Patta Generator Team`;

    return await this.sendEmail(
      settings.emailNotifications.email,
      subject,
      message,
      'info'
    );
  },

  // Send test email
  async sendTestEmail() {
    if (!this.isEmailEnabled()) {
      return { success: false, message: 'Email notifications not enabled' };
    }

    const settings = this.getSettings();
    const subject = '🧪 Test Email - FRA Patta Generator';
    const message = `Hello!

This is a test email to verify your email notification settings are working correctly.

📧 Configuration Details:
• Email: ${settings.emailNotifications.email}
• Enabled Types: ${settings.emailNotifications.types?.join(', ') || 'None'}
• Test Time: ${new Date().toLocaleString('en-IN')}

✅ If you received this email, your email notifications are configured properly!

You can modify your email preferences in the Settings page of FRA Patta Generator.

Best regards,
FRA Patta Generator Team`;

    return await this.sendEmail(
      settings.emailNotifications.email,
      subject,
      message,
      'info'
    );
  }
};

// Export individual functions for convenience
export const {
  notifyPDFGenerated,
  notifySystemAlert,
  notifyStatusUpdate,
  sendTestEmail
} = NotificationService;

export default NotificationService;