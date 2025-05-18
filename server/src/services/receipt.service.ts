import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import PosTransaction from '../models/posTransaction.model';
import Customer from '../models/customer.model';
import { PosTransactionType } from '../interfaces/posTransaction.interface';
import { sendEmail } from './email.service';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { formatCurrency, formatDate } from '../utils/formatters';

// Register handlebars helpers
handlebars.registerHelper('formatCurrency', function(value) {
  return formatCurrency(value);
});

handlebars.registerHelper('formatDate', function(date) {
  return formatDate(date, false);
});

handlebars.registerHelper('formatDateShort', function(date) {
  return formatDate(date, false);
});

handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

/**
 * Generate receipt HTML for a transaction
 */
export const generateReceiptHtml = async (transactionId: string) => {
  try {
    // Get transaction with populated fields
    const transaction = await PosTransaction.findById(transactionId)
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('location', 'name address phone email')
      .populate('cashier', 'firstName lastName')
      .populate('items.product', 'name sku barcode')
      .populate('originalSale', 'saleNumber saleDate total');

    if (!transaction) {
      throw new AppError(`Transaction not found: ${transactionId}`, 404);
    }

    // Load receipt template
    const templatePath = path.join(__dirname, '../templates/receipt.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    // Prepare data for template
    const receiptData = {
      transaction: {
        ...transaction.toObject(),
        isReturn: [PosTransactionType.RETURN, PosTransactionType.PARTIAL_RETURN].includes(transaction.transactionType as PosTransactionType),
        isExchange: transaction.transactionType === PosTransactionType.EXCHANGE,
        isSale: transaction.transactionType === PosTransactionType.SALE,
        isVoid: transaction.transactionType === PosTransactionType.VOID,
      },
      store: {
        name: 'PharmaSync',
        address: (transaction.location as any)?.address || 'No address provided',
        phone: (transaction.location as any)?.phone || 'No phone provided',
        email: (transaction.location as any)?.email || 'No email provided',
        website: 'www.pharmasync.com',
      },
      date: new Date(),
    };

    // Generate HTML
    const html = template(receiptData);

    return html;
  } catch (error) {
    logger.error('Error generating receipt HTML:', error);
    throw error;
  }
};

/**
 * Send receipt email to customer
 */
export const sendReceiptEmail = async (transactionId: string) => {
  try {
    // Get transaction
    const transaction = await PosTransaction.findById(transactionId)
      .populate('customer', 'firstName lastName customerNumber email phone');

    if (!transaction) {
      throw new AppError(`Transaction not found: ${transactionId}`, 404);
    }

    // Check if customer has email
    const customer = transaction.customer as any;
    if (!customer || !customer.email) {
      throw new AppError('Customer has no email address', 400);
    }

    // Generate receipt HTML
    const receiptHtml = await generateReceiptHtml(transactionId);

    // Send email
    const subject = `Your Receipt from PharmaSync - ${transaction.saleNumber}`;
    const result = await sendEmail({
      to: customer.email,
      subject,
      text: `Your receipt for transaction ${transaction.saleNumber}`,
      html: receiptHtml,
    });

    // Update transaction
    transaction.emailSent = true;
    await transaction.save();

    return {
      success: true,
      message: `Receipt sent to ${customer.email}`,
    };
  } catch (error) {
    logger.error('Error sending receipt email:', error);
    throw error;
  }
};

/**
 * Schedule refill reminder email
 */
export const scheduleRefillReminder = async (transactionId: string, reminderDate: Date) => {
  try {
    // Get transaction
    const transaction = await PosTransaction.findById(transactionId)
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('items.product', 'name sku barcode');

    if (!transaction) {
      throw new AppError(`Transaction not found: ${transactionId}`, 404);
    }

    // Check if customer has email
    const customer = transaction.customer as any;
    if (!customer || !customer.email) {
      throw new AppError('Customer has no email address', 400);
    }

    // Update transaction with reminder date
    transaction.refillReminder = true;
    transaction.refillReminderDate = reminderDate;
    await transaction.save();

    return {
      success: true,
      message: `Refill reminder scheduled for ${reminderDate.toLocaleDateString()}`,
    };
  } catch (error) {
    logger.error('Error scheduling refill reminder:', error);
    throw error;
  }
};

/**
 * Send refill reminder emails for transactions due today
 * This should be run as a scheduled job
 */
export const sendRefillReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find transactions with refill reminders due today
    const transactions = await PosTransaction.find({
      refillReminder: true,
      refillReminderDate: {
        $gte: today,
        $lt: tomorrow,
      },
      emailSent: false, // Only send if not already sent
    }).populate('customer', 'firstName lastName customerNumber email phone')
      .populate('items.product', 'name sku barcode');

    logger.info(`Found ${transactions.length} refill reminders to send`);

    // Send reminder emails
    const results = await Promise.all(
      transactions.map(async (transaction) => {
        try {
          const customer = transaction.customer as any;
          if (!customer || !customer.email) {
            return {
              transactionId: transaction._id,
              success: false,
              message: 'Customer has no email address',
            };
          }

          // Load reminder template
          const templatePath = path.join(__dirname, '../templates/refill-reminder.hbs');
          const templateSource = fs.readFileSync(templatePath, 'utf8');
          const template = handlebars.compile(templateSource);

          // Prepare data for template
          const reminderData = {
            customer: {
              firstName: customer.firstName,
              lastName: customer.lastName,
            },
            transaction: transaction.toObject(),
            store: {
              name: 'PharmaSync',
              phone: '123-456-7890',
              email: 'pharmacy@pharmasync.com',
              website: 'www.pharmasync.com',
            },
            date: new Date(),
          };

          // Generate HTML
          const html = template(reminderData);

          // Send email
          const subject = `Medication Refill Reminder - PharmaSync`;
          await sendEmail({
            to: customer.email,
            subject,
            text: `Your medication refill reminder from PharmaSync`,
            html,
          });

          // Update transaction
          transaction.emailSent = true;
          await transaction.save();

          return {
            transactionId: transaction._id,
            success: true,
            message: `Reminder sent to ${customer.email}`,
          };
        } catch (error) {
          logger.error(`Error sending reminder for transaction ${transaction._id}:`, error);
          return {
            transactionId: transaction._id,
            success: false,
            message: error.message,
          };
        }
      })
    );

    return {
      total: transactions.length,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      details: results,
    };
  } catch (error) {
    logger.error('Error sending refill reminders:', error);
    throw error;
  }
};
