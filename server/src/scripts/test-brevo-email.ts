/**
 * Test script for Brevo email integration
 *
 * Usage:
 * ts-node src/scripts/test-brevo-email.ts [recipient-email]
 */

import dotenv from 'dotenv';
import * as emailService from '../services/email.service';
import config from '../config';

// Load environment variables
dotenv.config();

const testBrevoEmail = async () => {
  try {
    console.log('Testing Brevo email integration...');
    console.log('Configuration:');
    console.log(
      '- API Key:',
      config.email.apiKey ? '****' + config.email.apiKey.slice(-4) : 'Not set'
    );
    console.log('- From Email:', config.email.fromEmail);
    console.log('- From Name:', config.email.fromName);

    // Get recipient email from command line or use default
    const testEmail = process.argv[2] || 'megagigdev@gmail.com';
    console.log(`- Sending test email to: ${testEmail}`);

    // Create HTML content with timestamp
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4f46e5;">PharmaSync - Brevo Test</h1>
        <p>This is a test email sent using Brevo integration.</p>
        <p>If you're seeing this email, the Brevo integration is working correctly!</p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          <p>This is an automated test message from PharmaSync.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        </div>
      </div>
    `;

    // Send the email using our email service
    const result = await emailService.sendEmail({
      to: testEmail,
      subject: 'PharmaSync - Brevo Test Email',
      text: 'This is a test email sent using Brevo integration.',
      html: htmlContent,
    });

    if (result) {
      console.log('✅ Test email sent successfully!');
    } else {
      console.error('❌ Failed to send test email.');
    }
  } catch (error) {
    console.error('❌ Error testing Brevo email:', error);
  }
};

// Run the test
testBrevoEmail();
