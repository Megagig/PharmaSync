import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { AppError } from '../utils/error';
import * as receiptService from '../services/receipt.service';

/**
 * Generate receipt HTML
 * @route GET /api/receipts/:transactionId/html
 * @access Private
 */
export const generateReceiptHtml = asyncHandler(
  async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    
    const html = await receiptService.generateReceiptHtml(transactionId);
    
    res.status(200).send(html);
  }
);

/**
 * Send receipt email
 * @route POST /api/receipts/:transactionId/email
 * @access Private
 */
export const sendReceiptEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    
    const result = await receiptService.sendReceiptEmail(transactionId);
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Schedule refill reminder
 * @route POST /api/receipts/:transactionId/refill-reminder
 * @access Private
 */
export const scheduleRefillReminder = asyncHandler(
  async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    const { reminderDate } = req.body;
    
    if (!reminderDate) {
      throw new AppError('Reminder date is required', 400);
    }
    
    const result = await receiptService.scheduleRefillReminder(
      transactionId,
      new Date(reminderDate)
    );
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Send refill reminders (admin only)
 * @route POST /api/receipts/send-refill-reminders
 * @access Private (Admin only)
 */
export const sendRefillReminders = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await receiptService.sendRefillReminders();
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);
