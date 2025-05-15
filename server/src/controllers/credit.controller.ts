import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import CreditTransaction from '../models/creditTransaction.model';
import Customer from '../models/customer.model';
import { CreditTransactionType } from '../interfaces/credit.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get credit transactions for a customer
 * @route   GET /api/customers/:customerId/credit
 * @access  Private
 */
export const getCustomerCreditTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Get total count
    const total = await CreditTransaction.countDocuments({ customer: customerId });

    // Get transactions with pagination
    const transactions = await CreditTransaction.find({ customer: customerId })
      .populate('createdBy', 'firstName lastName')
      .populate('sale', 'saleNumber saleDate')
      .populate('payment', 'paymentNumber paymentDate')
      .populate('invoice', 'invoiceNumber invoiceDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: transactions,
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
 * @desc    Get credit summary for a customer
 * @route   GET /api/customers/:customerId/credit/summary
 * @access  Private
 */
export const getCustomerCreditSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Get latest transactions (limited to 5)
    const recentTransactions = await CreditTransaction.find({ customer: customerId })
      .populate('createdBy', 'firstName lastName')
      .populate('sale', 'saleNumber saleDate')
      .populate('payment', 'paymentNumber paymentDate')
      .populate('invoice', 'invoiceNumber invoiceDate')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get last transaction date
    const lastTransaction = await CreditTransaction.findOne({ customer: customerId })
      .sort({ createdAt: -1 });

    const creditSummary = {
      customer: customerId,
      creditLimit: customer.creditLimit || 0,
      currentBalance: customer.currentBalance,
      availableCredit: (customer.creditLimit || 0) - customer.currentBalance,
      lastTransactionDate: lastTransaction ? lastTransaction.createdAt : null,
      transactions: recentTransactions,
    };

    res.status(200).json({
      status: 'success',
      data: creditSummary,
    });
  }
);

/**
 * @desc    Create a credit transaction
 * @route   POST /api/customers/:customerId/credit
 * @access  Private (Admin/Manager only)
 */
export const createCreditTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const {
      transactionType,
      amount,
      description,
      reference,
      sale,
      payment,
      invoice,
    } = req.body;

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Calculate new balance based on transaction type
    let newBalance = customer.currentBalance;
    
    switch (transactionType) {
      case CreditTransactionType.SALE_ON_CREDIT:
        newBalance += amount;
        break;
      case CreditTransactionType.PAYMENT:
        newBalance -= amount;
        break;
      case CreditTransactionType.CREDIT_ADJUSTMENT:
        // For adjustments, amount can be positive (increase) or negative (decrease)
        newBalance += amount;
        break;
      case CreditTransactionType.CREDIT_INCREASE:
        // This doesn't affect balance, only credit limit
        customer.creditLimit = (customer.creditLimit || 0) + amount;
        break;
      case CreditTransactionType.CREDIT_DECREASE:
        // This doesn't affect balance, only credit limit
        const newCreditLimit = (customer.creditLimit || 0) - amount;
        customer.creditLimit = Math.max(0, newCreditLimit);
        break;
      default:
        throw new AppError('Invalid transaction type', 400);
    }

    // Create transaction
    const transaction = await CreditTransaction.create({
      customer: customerId,
      transactionType,
      amount,
      balance: newBalance,
      description,
      reference,
      sale,
      payment,
      invoice,
      createdBy: req.user.id,
    });

    // Update customer balance
    customer.currentBalance = newBalance;
    await customer.save();

    res.status(201).json({
      status: 'success',
      data: transaction,
    });
  }
);

/**
 * @desc    Update customer credit limit
 * @route   PATCH /api/customers/:customerId/credit/limit
 * @access  Private (Admin/Manager only)
 */
export const updateCustomerCreditLimit = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { creditLimit, reason } = req.body;

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Get old credit limit
    const oldCreditLimit = customer.creditLimit || 0;

    // Update credit limit
    customer.creditLimit = creditLimit;
    await customer.save();

    // Create a credit limit adjustment transaction
    const transactionType = creditLimit > oldCreditLimit
      ? CreditTransactionType.CREDIT_INCREASE
      : CreditTransactionType.CREDIT_DECREASE;
    
    const amount = Math.abs(creditLimit - oldCreditLimit);
    
    await CreditTransaction.create({
      customer: customerId,
      transactionType,
      amount,
      balance: customer.currentBalance,
      description: `Credit limit ${transactionType === CreditTransactionType.CREDIT_INCREASE ? 'increased' : 'decreased'}: ${reason}`,
      createdBy: req.user.id,
    });

    res.status(200).json({
      status: 'success',
      data: {
        customerId,
        creditLimit,
        oldCreditLimit,
        currentBalance: customer.currentBalance,
        availableCredit: creditLimit - customer.currentBalance,
      },
    });
  }
);
