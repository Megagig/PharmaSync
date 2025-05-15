import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Reminder from '../models/reminder.model';
import Customer from '../models/customer.model';
import Invoice from '../models/invoice.model';
import Payment from '../models/payment.model';
import { ReminderStatus, ReminderType } from '../interfaces/reminder.interface';
import { InvoiceStatus } from '../interfaces/invoice.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all reminders with pagination and filtering
 * @route   GET /api/reminders
 * @access  Private
 */
export const getAllReminders = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by customer
    if (req.query.customer) {
      filter.customer = req.query.customer;
    }

    // Filter by type
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.scheduledDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Get total count
    const total = await Reminder.countDocuments(filter);

    // Get reminders with pagination
    const reminders = await Reminder.find(filter)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('invoice', 'invoiceNumber invoiceDate dueDate total balance')
      .populate('payment', 'paymentNumber paymentDate amount')
      .populate('createdBy', 'firstName lastName')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: reminders,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Get reminder by ID
 * @route   GET /api/reminders/:id
 * @access  Private
 */
export const getReminderById = asyncHandler(
  async (req: Request, res: Response) => {
    const reminder = await Reminder.findById(req.params.id)
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('invoice', 'invoiceNumber invoiceDate dueDate total balance')
      .populate('payment', 'paymentNumber paymentDate amount')
      .populate('createdBy', 'firstName lastName');

    if (!reminder) {
      throw new AppError('Reminder not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: reminder,
    });
  }
);

/**
 * @desc    Create new reminder
 * @route   POST /api/reminders
 * @access  Private
 */
export const createReminder = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      customer: customerId,
      type,
      subject,
      message,
      scheduledDate,
      invoice: invoiceId,
      payment: paymentId,
    } = req.body;

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Check if invoice exists if provided
    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new AppError('Invoice not found', 404);
      }
    }

    // Check if payment exists if provided
    if (paymentId) {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new AppError('Payment not found', 404);
      }
    }

    // Create reminder
    const reminder = await Reminder.create({
      customer: customerId,
      type,
      subject,
      message,
      scheduledDate: new Date(scheduledDate),
      invoice: invoiceId,
      payment: paymentId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      data: reminder,
    });
  }
);

/**
 * @desc    Update reminder
 * @route   PATCH /api/reminders/:id
 * @access  Private
 */
export const updateReminder = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, subject, message, scheduledDate } = req.body;

    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      throw new AppError('Reminder not found', 404);
    }

    // Update fields
    if (status) reminder.status = status;
    if (subject) reminder.subject = subject;
    if (message) reminder.message = message;
    if (scheduledDate) reminder.scheduledDate = new Date(scheduledDate);

    // If status is changed to SENT, update sentDate
    if (status === ReminderStatus.SENT && reminder.status !== ReminderStatus.SENT) {
      reminder.sentDate = new Date();
    }

    await reminder.save();

    res.status(200).json({
      status: 'success',
      data: reminder,
    });
  }
);

/**
 * @desc    Delete reminder
 * @route   DELETE /api/reminders/:id
 * @access  Private
 */
export const deleteReminder = asyncHandler(
  async (req: Request, res: Response) => {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      throw new AppError('Reminder not found', 404);
    }

    await reminder.remove();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Send reminder
 * @route   POST /api/reminders/:id/send
 * @access  Private
 */
export const sendReminder = asyncHandler(
  async (req: Request, res: Response) => {
    const reminder = await Reminder.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('invoice', 'invoiceNumber invoiceDate dueDate total balance')
      .populate('payment', 'paymentNumber paymentDate amount');

    if (!reminder) {
      throw new AppError('Reminder not found', 404);
    }

    if (reminder.status === ReminderStatus.SENT) {
      throw new AppError('Reminder has already been sent', 400);
    }

    if (reminder.status === ReminderStatus.CANCELLED) {
      throw new AppError('Cannot send a cancelled reminder', 400);
    }

    // In a real application, you would send an email or SMS here
    // For now, we'll just update the status
    reminder.status = ReminderStatus.SENT;
    reminder.sentDate = new Date();
    await reminder.save();

    res.status(200).json({
      status: 'success',
      data: reminder,
    });
  }
);

/**
 * @desc    Generate invoice due reminders
 * @route   POST /api/reminders/generate/invoice-due
 * @access  Private (Admin/Manager only)
 */
export const generateInvoiceDueReminders = asyncHandler(
  async (req: Request, res: Response) => {
    // Find invoices that are due in the next 7 days and don't have reminders yet
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const invoices = await Invoice.find({
      status: { $in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL] },
      dueDate: { $lte: dueDate, $gte: new Date() },
    }).populate('customer');

    const createdReminders = [];

    for (const invoice of invoices) {
      // Check if a reminder already exists for this invoice
      const existingReminder = await Reminder.findOne({
        invoice: invoice._id,
        type: ReminderType.INVOICE_DUE,
        status: { $ne: ReminderStatus.CANCELLED },
      });

      if (!existingReminder) {
        const customer = invoice.customer as any;
        
        // Create a new reminder
        const reminder = await Reminder.create({
          customer: customer._id,
          type: ReminderType.INVOICE_DUE,
          subject: `Invoice ${invoice.invoiceNumber} is due soon`,
          message: `Dear ${customer.firstName} ${customer.lastName},\n\nThis is a friendly reminder that invoice ${invoice.invoiceNumber} for ${invoice.total} is due on ${new Date(invoice.dueDate).toLocaleDateString()}.\n\nPlease make your payment before the due date to avoid late fees.\n\nThank you for your business.`,
          scheduledDate: new Date(), // Schedule for today
          invoice: invoice._id,
          createdBy: req.user.id,
        });

        createdReminders.push(reminder);
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        count: createdReminders.length,
        reminders: createdReminders,
      },
    });
  }
);

/**
 * @desc    Generate invoice overdue reminders
 * @route   POST /api/reminders/generate/invoice-overdue
 * @access  Private (Admin/Manager only)
 */
export const generateInvoiceOverdueReminders = asyncHandler(
  async (req: Request, res: Response) => {
    // Find invoices that are overdue and don't have reminders yet
    const invoices = await Invoice.find({
      status: { $in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
      dueDate: { $lt: new Date() },
    }).populate('customer');

    const createdReminders = [];

    for (const invoice of invoices) {
      // Check if a reminder already exists for this invoice
      const existingReminder = await Reminder.findOne({
        invoice: invoice._id,
        type: ReminderType.INVOICE_OVERDUE,
        status: { $ne: ReminderStatus.CANCELLED },
      });

      if (!existingReminder) {
        const customer = invoice.customer as any;
        
        // Create a new reminder
        const reminder = await Reminder.create({
          customer: customer._id,
          type: ReminderType.INVOICE_OVERDUE,
          subject: `Invoice ${invoice.invoiceNumber} is overdue`,
          message: `Dear ${customer.firstName} ${customer.lastName},\n\nThis is a reminder that invoice ${invoice.invoiceNumber} for ${invoice.total} was due on ${new Date(invoice.dueDate).toLocaleDateString()} and is now overdue.\n\nPlease make your payment as soon as possible.\n\nThank you for your business.`,
          scheduledDate: new Date(), // Schedule for today
          invoice: invoice._id,
          createdBy: req.user.id,
        });

        createdReminders.push(reminder);
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        count: createdReminders.length,
        reminders: createdReminders,
      },
    });
  }
);
