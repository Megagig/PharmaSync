import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import GeneralLedger from '../models/generalLedger.model';
import Account from '../models/account.model';
import { AppError } from '../utils/error';

/**
 * @desc    Get general ledger entries with pagination and filtering
 * @route   GET /api/accounting/general-ledger
 * @access  Private
 */
export const getGeneralLedgerEntries = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by account
    if (req.query.account) {
      filter.account = req.query.account;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Get total count
    const total = await GeneralLedger.countDocuments(filter);

    // Get general ledger entries with pagination
    const entries = await GeneralLedger.find(filter)
      .populate('account', 'accountNumber name')
      .populate('journalEntry', 'entryNumber description')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: entries,
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
 * @desc    Get account statement (all transactions for a specific account)
 * @route   GET /api/accounting/general-ledger/account/:id
 * @access  Private
 */
export const getAccountStatement = asyncHandler(
  async (req: Request, res: Response) => {
    const accountId = req.params.id;
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(0); // Beginning of time
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date(); // Current time

    // Verify account exists
    const account = await Account.findById(accountId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Get opening balance (balance at start date)
    const openingBalanceEntries = await GeneralLedger.find({
      account: accountId,
      date: { $lt: startDate },
    }).sort({ date: -1, createdAt: -1 });

    // Calculate opening balance
    let openingBalance = account.openingBalance;
    if (openingBalanceEntries.length > 0) {
      openingBalance = openingBalanceEntries[0].balance;
    }

    // Get transactions within date range
    const transactions = await GeneralLedger.find({
      account: accountId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('journalEntry', 'entryNumber description reference')
      .sort({ date: 1, createdAt: 1 });

    // Calculate running balance
    let runningBalance = openingBalance;
    const transactionsWithBalance = transactions.map(transaction => {
      const netAmount = (transaction.debit || 0) - (transaction.credit || 0);
      runningBalance += netAmount;
      
      return {
        ...transaction.toObject(),
        runningBalance,
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        account,
        openingBalance,
        closingBalance: runningBalance,
        transactions: transactionsWithBalance,
      },
    });
  }
);

/**
 * @desc    Get trial balance
 * @route   GET /api/accounting/general-ledger/trial-balance
 * @access  Private
 */
export const getTrialBalance = asyncHandler(
  async (req: Request, res: Response) => {
    const asOfDate = req.query.asOfDate 
      ? new Date(req.query.asOfDate as string) 
      : new Date(); // Current time

    // Get all active accounts
    const accounts = await Account.find({ status: 'active' });

    // Get balances for each account
    const trialBalance = await Promise.all(
      accounts.map(async account => {
        // Get the latest general ledger entry for this account before or on the specified date
        const latestEntry = await GeneralLedger.findOne({
          account: account._id,
          date: { $lte: asOfDate },
        }).sort({ date: -1, createdAt: -1 });

        // Use the balance from the latest entry, or the opening balance if no entries exist
        const balance = latestEntry ? latestEntry.balance : account.openingBalance;

        return {
          account: {
            _id: account._id,
            accountNumber: account.accountNumber,
            name: account.name,
            type: account.type,
            category: account.category,
          },
          debit: balance > 0 ? balance : 0,
          credit: balance < 0 ? Math.abs(balance) : 0,
        };
      })
    );

    // Calculate totals
    const totalDebit = trialBalance.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = trialBalance.reduce((sum, item) => sum + item.credit, 0);

    res.status(200).json({
      status: 'success',
      data: {
        asOfDate,
        trialBalance,
        totalDebit,
        totalCredit,
        isBalanced: totalDebit === totalCredit,
      },
    });
  }
);
