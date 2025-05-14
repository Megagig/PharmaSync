import nodemailer from 'nodemailer';
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
 * Send an email using nodemailer
 * @param options Email options
 * @returns Promise<boolean> True if email was sent successfully
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
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
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
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
          ${
            link
              ? `<a href="${link}" class="button">${buttonText}</a>`
              : ''
          }
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
 * Send a password reset email
 * @param to Recipient email
 * @param resetToken Reset token
 * @param userName User's name
 * @returns Promise<boolean> True if email was sent successfully
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  userName: string
): Promise<boolean> => {
  const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
  
  const subject = 'Password Reset Request';
  const text = `Hello ${userName},\n\nYou are receiving this email because you (or someone else) has requested the reset of a password.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;
  
  const html = generateNotificationEmail(
    'Password Reset Request',
    `Hello ${userName},<br><br>You are receiving this email because you (or someone else) has requested the reset of a password.<br><br>Please click the button below to complete the process:`,
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
