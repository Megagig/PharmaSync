import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Account from '../models/account.model';
import { AccountStatus } from '../interfaces/accounting.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all accounts with pagination and filtering
 * @route   GET /api/accounting/accounts
 * @access  Private
 */
export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {};

  // Filter by account type
  if (req.query.type) {
    filter.type = req.query.type;
  }

  // Filter by account category
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Filter by account status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by parent account
  if (req.query.parentAccount) {
    filter.parentAccount = req.query.parentAccount;
  }

  // Filter by sub-accounts
  if (req.query.isSubAccount) {
    filter.isSubAccount = req.query.isSubAccount === 'true';
  }

  // Search by account number or name
  if (req.query.search) {
    filter.$or = [
      { accountNumber: { $regex: req.query.search, $options: 'i' } },
      { name: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Get total count
  const total = await Account.countDocuments(filter);

  // Get accounts with pagination
  const accounts = await Account.find(filter)
    .populate('parentAccount', 'accountNumber name')
    .populate('createdBy', 'firstName lastName')
    .populate('updatedBy', 'firstName lastName')
    .sort({ accountNumber: 1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    data: accounts,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get account by ID
 * @route   GET /api/accounting/accounts/:id
 * @access  Private
 */
export const getAccountById = asyncHandler(
  async (req: Request, res: Response) => {
    const account = await Account.findById(req.params.id)
      .populate('parentAccount', 'accountNumber name')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: account,
    });
  }
);

/**
 * @desc    Create new account
 * @route   POST /api/accounting/accounts
 * @access  Private
 */
export const createAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      accountNumber,
      name,
      description,
      type,
      category,
      parentAccount,
      isSubAccount,
      status,
      openingBalance,
      notes,
    } = req.body;

    // Check if account number already exists
    const existingAccount = await Account.findOne({ accountNumber });
    if (existingAccount) {
      throw new AppError('Account number already exists', 400);
    }

    // Verify parent account exists if specified
    if (parentAccount) {
      const parentAccountExists = await Account.findById(parentAccount);
      if (!parentAccountExists) {
        throw new AppError('Parent account not found', 404);
      }
    }

    // Create account
    const account = await Account.create({
      accountNumber,
      name,
      description,
      type,
      category,
      parentAccount: parentAccount || undefined,
      isSubAccount: isSubAccount || (parentAccount ? true : false),
      status: status || AccountStatus.ACTIVE,
      balance: openingBalance || 0,
      openingBalance: openingBalance || 0,
      currentBalance: openingBalance || 0,
      notes,
      createdBy: req.user.id, // From auth middleware
    });

    res.status(201).json({
      status: 'success',
      data: account,
    });
  }
);

/**
 * @desc    Update account
 * @route   PATCH /api/accounting/accounts/:id
 * @access  Private
 */
export const updateAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      category,
      parentAccount,
      isSubAccount,
      status,
      notes,
    } = req.body;

    const account = await Account.findById(req.params.id);

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Prevent updating system accounts
    if (account.isSystemAccount) {
      throw new AppError('System accounts cannot be modified', 400);
    }

    // Prevent updating locked accounts
    if (account.isLocked) {
      throw new AppError('Locked accounts cannot be modified', 400);
    }

    // Verify parent account exists if specified
    if (parentAccount && parentAccount !== account.parentAccount?.toString()) {
      const parentAccountExists = await Account.findById(parentAccount);
      if (!parentAccountExists) {
        throw new AppError('Parent account not found', 404);
      }
    }

    // Update fields
    if (name) account.name = name;
    if (description !== undefined) account.description = description;
    if (category) account.category = category;
    if (parentAccount !== undefined)
      account.parentAccount = parentAccount || undefined;
    if (isSubAccount !== undefined) account.isSubAccount = isSubAccount;
    if (status) account.status = status;
    if (notes !== undefined) account.notes = notes;
    account.updatedBy = req.user.id; // From auth middleware

    await account.save();

    res.status(200).json({
      status: 'success',
      data: account,
    });
  }
);

/**
 * @desc    Delete account
 * @route   DELETE /api/accounting/accounts/:id
 * @access  Private (Admin only)
 */
export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const account = await Account.findById(req.params.id);

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Prevent deleting system accounts
    if (account.isSystemAccount) {
      throw new AppError('System accounts cannot be deleted', 400);
    }

    // Prevent deleting locked accounts
    if (account.isLocked) {
      throw new AppError('Locked accounts cannot be deleted', 400);
    }

    // Check if account has transactions
    // TODO: Add check for transactions in general ledger

    // Delete account
    await account.deleteOne();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);
