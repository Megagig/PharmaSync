// Import nodemailer for fallback
import nodemailer from 'nodemailer';
// Import axios for direct API calls to Brevo
import axios from 'axios';
import config from '../config';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

/**
 * Send an email using Brevo API directly
 * @param options Email options
 * @returns Promise<boolean> True if email was sent successfully
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // In development mode, log the email but don't actually send it
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.MOCK_EMAILS === 'true'
  ) {
    console.log('MOCK EMAIL SENDING (Development Mode):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Text:', options.text);
    console.log(
      'HTML:',
      options.html ? 'HTML content available' : 'No HTML content'
    );
    return true;
  }

  try {
    // Format recipients
    const recipients = Array.isArray(options.to)
      ? options.to.map((email) => ({ email: email }))
      : [{ email: options.to }];

    // Prepare email data for Brevo API
    const emailData = {
      sender: {
        name: config.email.fromName,
        email: config.email.fromEmail,
      },
      to: recipients,
      subject: options.subject,
      textContent: options.text,
      htmlContent: options.html || '',
    };

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      emailData['attachment'] = options.attachments.map((attachment) => {
        return {
          name: attachment.filename,
          content:
            typeof attachment.content === 'string'
              ? Buffer.from(attachment.content).toString('base64')
              : attachment.content.toString('base64'),
          contentType: attachment.contentType,
        };
      });
    }

    // Send email using Brevo API with timeout
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      emailData,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'api-key': config.email.apiKey,
        },
        // Set a timeout to prevent long-hanging requests
        timeout: 10000, // 10 seconds timeout
      }
    );

    console.log('Email sent successfully:', response.data);
    return true;
  } catch (error: any) {
    console.error('Brevo email sending error:', error);

    // Check if it's a network error (timeout, connection refused, etc.)
    const isNetworkError =
      error.code &&
      (error.code === 'ECONNABORTED' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENETUNREACH');

    if (isNetworkError) {
      console.log(
        'Network error detected when sending email. This might be due to firewall restrictions or network issues.'
      );
    }

    // Try fallback methods
    return await tryFallbackMethods(options);
  }
};

/**
 * Try different fallback methods for sending emails
 * @param options Email options
 * @returns Promise<boolean> True if any method succeeded
 */
const tryFallbackMethods = async (options: EmailOptions): Promise<boolean> => {
  // 1. Try SMTP fallback if configured
  if (config.email.host && config.email.user && config.email.password) {
    try {
      console.log('Attempting fallback to SMTP...');
      const result = await sendEmailFallback(options);
      if (result) return true;
    } catch (fallbackError) {
      console.error('Fallback SMTP email sending error:', fallbackError);
    }
  }

  // 2. Store email in database for later sending (not implemented here)
  try {
    console.log('Storing email for later delivery...');
    // Here you would implement logic to store the email in a database queue
    // This is just a placeholder for the concept

    // For now, we'll just log that we would store it
    console.log('Email stored for later delivery:', {
      to: options.to,
      subject: options.subject,
      sentAt: new Date().toISOString(),
    });

    // Return false because the email wasn't actually sent
    return false;
  } catch (error) {
    console.error('Failed to store email for later delivery:', error);
    return false;
  }
};

/**
 * Fallback method to send email using nodemailer
 * @param options Email options
 * @returns Promise<boolean> True if email was sent successfully
 */
const sendEmailFallback = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    // Define email options
    const mailOptions = {
      from: `${config.email.fromName} <${config.email.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Fallback email sent successfully');
    return true;
  } catch (error) {
    console.error('Fallback email sending error:', error);
    return false;
  }
};

/**
 * Generate HTML for a notification email
 * @param title Email title
 * @param message Email message
 * @param link Optional link to include
 * @param buttonText Optional button text for the link
 * @returns HTML string
 */
export const generateNotificationEmail = (
  title: string,
  message: string,
  link?: string,
  buttonText: string = 'View Details'
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4f46e5;
          padding: 20px;
          text-align: center;
          color: white;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 0 0 5px 5px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 20px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>${message}</p>
          ${link ? `<a href="${link}" class="button">${buttonText}</a>` : ''}
        </div>
        <div class="footer">
          <p>This is an automated message from PharmaSync. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} PharmaSync. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send a welcome email
 * @param to Recipient email
 * @param userName User's name
 * @returns Promise<boolean> True if email was sent successfully
 */
export const sendWelcomeEmail = async (
  to: string,
  userName: string
): Promise<boolean> => {
  const loginUrl = `${config.clientUrl}/login`;

  const subject = 'Welcome to PharmaSync';
  const text = `Hello ${userName},\n\nWelcome to PharmaSync! We're excited to have you on board.\n\nYou can log in to your account using the following link:\n\n${loginUrl}\n\nIf you have any questions, please don't hesitate to contact us.\n`;

  const html = generateNotificationEmail(
    'Welcome to PharmaSync',
    `Hello ${userName},<br><br>Welcome to PharmaSync! We're excited to have you on board.<br><br>You can log in to your account by clicking the button below:`,
    loginUrl,
    'Log In'
  );

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};

/**
 * Send a registration confirmation email with pending approval message
 * @param to Recipient email
 * @param userName User's name
 * @returns Promise<boolean> True if email was sent successfully
 */
export const sendRegistrationConfirmationEmail = async (
  to: string,
  userName: string
): Promise<boolean> => {
  const subject = 'Registration Confirmation - PharmaSync';
  const text = `Hello ${userName},\n\nThank you for registering with PharmaSync!\n\nYour account is currently pending approval by an administrator. You will receive another email once your account has been approved.\n\nIf you have any questions, please don't hesitate to contact us.\n`;

  const html = generateNotificationEmail(
    'Registration Confirmation',
    `Hello ${userName},<br><br>Thank you for registering with PharmaSync!<br><br>Your account is currently <strong>pending approval</strong> by an administrator. You will receive another email once your account has been approved.<br><br>If you have any questions, please don't hesitate to contact us.`,
    null,
    null
  );

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};

/**
 * Send an account approval notification email
 * @param to Recipient email
 * @param userName User's name
 * @returns Promise<boolean> True if email was sent successfully
 */
export const sendAccountApprovalEmail = async (
  to: string,
  userName: string
): Promise<boolean> => {
  const loginUrl = `${config.clientUrl}/login`;

  const subject = 'Account Approved - PharmaSync';
  const text = `Hello ${userName},\n\nCongratulations! Your PharmaSync account has been approved by an administrator.\n\nYou can now log in to your account using the following link:\n\n${loginUrl}\n\nIf you have any questions, please don't hesitate to contact us.\n`;

  const html = generateNotificationEmail(
    'Account Approved',
    `Hello ${userName},<br><br>Congratulations! Your PharmaSync account has been <strong>approved</strong> by an administrator.<br><br>You can now log in to your account by clicking the button below:`,
    loginUrl,
    'Log In'
  );

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};

/**
 * Send an account rejection notification email
 * @param to Recipient email
 * @param userName User's name
 * @param reason Rejection reason
 * @returns Promise<boolean> True if email was sent successfully
 */
export const sendAccountRejectionEmail = async (
  to: string,
  userName: string,
  reason?: string
): Promise<boolean> => {
  const subject = 'Account Registration Status - PharmaSync';
  const reasonText = reason ? `\n\nReason: ${reason}` : '';
  const text = `Hello ${userName},\n\nWe regret to inform you that your PharmaSync account registration has been rejected.${reasonText}\n\nIf you believe this is an error or would like more information, please contact our support team.\n`;

  const reasonHtml = reason ? `<br><br><strong>Reason:</strong> ${reason}` : '';
  const html = generateNotificationEmail(
    'Account Registration Status',
    `Hello ${userName},<br><br>We regret to inform you that your PharmaSync account registration has been <strong>rejected</strong>.${reasonHtml}<br><br>If you believe this is an error or would like more information, please contact our support team.`,
    null,
    null
  );

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};

/**
 * Send a password reset email with a reset link
 * @param to Recipient email
 * @param userName User's name
 * @param resetUrl Password reset URL
 * @returns Promise<boolean> True if email was sent successfully
 */
export const sendPasswordResetEmail = async (
  to: string,
  userName: string,
  resetUrl: string
): Promise<boolean> => {
  const subject = 'Password Reset - PharmaSync';
  const text = `Hello ${userName},\n\nYou are receiving this email because you (or someone else) has requested a password reset for your account.\n\nPlease click on the following link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nThis link will expire in 1 hour.\n`;

  const html = generateNotificationEmail(
    'Password Reset Request',
    `Hello ${userName},<br><br>You are receiving this email because you (or someone else) has requested a password reset for your account.<br><br>Please click on the button below to reset your password:`,
    resetUrl,
    'Reset Password'
  );

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};
