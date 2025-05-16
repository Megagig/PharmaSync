import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import JournalEntry from '../models/journalEntry.model';
import Account from '../models/account.model';
import GeneralLedger from '../models/generalLedger.model';
import { JournalEntryStatus } from '../interfaces/accounting.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all journal entries with pagination and filtering
 * @route   GET /api/accounting/journal-entries
 * @access  Private
 */
export const getJournalEntries = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by type
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Filter by related entity
    if (req.query.entityType && req.query.entityId) {
      filter['relatedEntity.entityType'] = req.query.entityType;
      filter['relatedEntity.entityId'] = req.query.entityId;
    }

    // Search by entry number or description
    if (req.query.search) {
      filter.$or = [
        { entryNumber: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await JournalEntry.countDocuments(filter);

    // Get journal entries with pagination
    const journalEntries = await JournalEntry.find(filter)
      .populate('items.account', 'accountNumber name')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('postedBy', 'firstName lastName')
      .populate('reversedBy', 'firstName lastName')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: journalEntries,
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
 * @desc    Get journal entry by ID
 * @route   GET /api/accounting/journal-entries/:id
 * @access  Private
 */
export const getJournalEntryById = asyncHandler(
  async (req: Request, res: Response) => {
    const journalEntry = await JournalEntry.findById(req.params.id)
      .populate('items.account', 'accountNumber name')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('postedBy', 'firstName lastName')
      .populate('reversedBy', 'firstName lastName');

    if (!journalEntry) {
      throw new AppError('Journal entry not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: journalEntry,
    });
  }
);

/**
 * @desc    Create new journal entry
 * @route   POST /api/accounting/journal-entries
 * @access  Private
 */
export const createJournalEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      date,
      description,
      reference,
      type,
      items,
      isRecurring,
      recurringInterval,
      recurringEndDate,
      notes,
      relatedEntity,
    } = req.body;

    // Verify all accounts exist
    for (const item of items) {
      const accountExists = await Account.findById(item.account);
      if (!accountExists) {
        throw new AppError(`Account with ID ${item.account} not found`, 404);
      }
    }

    // Validate debits and credits balance
    const totalDebit = items.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = items.reduce((sum, item) => sum + (item.credit || 0), 0);

    if (totalDebit !== totalCredit) {
      throw new AppError('Debits and credits must balance', 400);
    }

    // Create journal entry
    const journalEntry = await JournalEntry.create({
      date: date || new Date(),
      description,
      reference,
      type,
      items,
      totalDebit,
      totalCredit,
      isRecurring: isRecurring || false,
      recurringInterval,
      recurringEndDate,
      notes,
      relatedEntity,
      createdBy: req.user.id, // From auth middleware
    });

    res.status(201).json({
      status: 'success',
      data: journalEntry,
    });
  }
);

/**
 * @desc    Update journal entry
 * @route   PATCH /api/accounting/journal-entries/:id
 * @access  Private
 */
export const updateJournalEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      date,
      description,
      reference,
      items,
      isRecurring,
      recurringInterval,
      recurringEndDate,
      notes,
    } = req.body;

    const journalEntry = await JournalEntry.findById(req.params.id);

    if (!journalEntry) {
      throw new AppError('Journal entry not found', 404);
    }

    // Only draft entries can be updated
    if (journalEntry.status !== JournalEntryStatus.DRAFT) {
      throw new AppError('Only draft journal entries can be updated', 400);
    }

    // Verify all accounts exist if items are being updated
    if (items) {
      for (const item of items) {
        const accountExists = await Account.findById(item.account);
        if (!accountExists) {
          throw new AppError(`Account with ID ${item.account} not found`, 404);
        }
      }

      // Validate debits and credits balance
      const totalDebit = items.reduce((sum, item) => sum + (item.debit || 0), 0);
      const totalCredit = items.reduce((sum, item) => sum + (item.credit || 0), 0);

      if (totalDebit !== totalCredit) {
        throw new AppError('Debits and credits must balance', 400);
      }
    }

    // Update fields
    if (date) journalEntry.date = new Date(date);
    if (description) journalEntry.description = description;
    if (reference !== undefined) journalEntry.reference = reference;
    if (items) journalEntry.items = items;
    if (isRecurring !== undefined) journalEntry.isRecurring = isRecurring;
    if (recurringInterval) journalEntry.recurringInterval = recurringInterval;
    if (recurringEndDate) journalEntry.recurringEndDate = new Date(recurringEndDate);
    if (notes !== undefined) journalEntry.notes = notes;

    await journalEntry.save();

    res.status(200).json({
      status: 'success',
      data: journalEntry,
    });
  }
);

/**
 * @desc    Delete journal entry
 * @route   DELETE /api/accounting/journal-entries/:id
 * @access  Private (Admin only)
 */
export const deleteJournalEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const journalEntry = await JournalEntry.findById(req.params.id);

    if (!journalEntry) {
      throw new AppError('Journal entry not found', 404);
    }

    // Only draft entries can be deleted
    if (journalEntry.status !== JournalEntryStatus.DRAFT) {
      throw new AppError('Only draft journal entries can be deleted', 400);
    }

    // Delete journal entry
    await journalEntry.remove();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Post journal entry to general ledger
 * @route   PATCH /api/accounting/journal-entries/:id/post
 * @access  Private
 */
export const postJournalEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const journalEntry = await JournalEntry.findById(req.params.id);

    if (!journalEntry) {
      throw new AppError('Journal entry not found', 404);
    }

    // Only draft entries can be posted
    if (journalEntry.status !== JournalEntryStatus.DRAFT) {
      throw new AppError('Only draft journal entries can be posted', 400);
    }

    // Update journal entry status
    journalEntry.status = JournalEntryStatus.POSTED;
    journalEntry.postedBy = req.user.id; // From auth middleware
    journalEntry.postedAt = new Date();

    await journalEntry.save();

    // Create general ledger entries
    for (const item of journalEntry.items) {
      const account = await Account.findById(item.account);
      
      if (!account) {
        throw new AppError(`Account with ID ${item.account} not found`, 404);
      }

      // Update account balance
      const netAmount = (item.debit || 0) - (item.credit || 0);
      account.balance += netAmount;
      await account.save();

      // Create general ledger entry
      await GeneralLedger.create({
        account: item.account,
        journalEntry: journalEntry._id,
        date: journalEntry.date,
        description: item.description || journalEntry.description,
        debit: item.debit || 0,
        credit: item.credit || 0,
        balance: account.balance,
        reference: journalEntry.reference,
      });
    }

    res.status(200).json({
      status: 'success',
      data: journalEntry,
    });
  }
);

/**
 * @desc    Reverse journal entry
 * @route   PATCH /api/accounting/journal-entries/:id/reverse
 * @access  Private
 */
export const reverseJournalEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const { reason } = req.body;

    const journalEntry = await JournalEntry.findById(req.params.id);

    if (!journalEntry) {
      throw new AppError('Journal entry not found', 404);
    }

    // Only posted entries can be reversed
    if (journalEntry.status !== JournalEntryStatus.POSTED) {
      throw new AppError('Only posted journal entries can be reversed', 400);
    }

    // Update journal entry status
    journalEntry.status = JournalEntryStatus.REVERSED;
    journalEntry.reversedBy = req.user.id; // From auth middleware
    journalEntry.reversedAt = new Date();
    journalEntry.notes = journalEntry.notes 
      ? `${journalEntry.notes}\n\nReversed: ${reason}` 
      : `Reversed: ${reason}`;

    await journalEntry.save();

    // Create reversing journal entry
    const reversingItems = journalEntry.items.map(item => ({
      account: item.account,
      description: item.description,
      debit: item.credit || 0,
      credit: item.debit || 0,
    }));

    const reversingEntry = await JournalEntry.create({
      date: new Date(),
      description: `Reversal of ${journalEntry.entryNumber}: ${journalEntry.description}`,
      reference: journalEntry.entryNumber,
      type: journalEntry.type,
      items: reversingItems,
      totalDebit: journalEntry.totalCredit,
      totalCredit: journalEntry.totalDebit,
      notes: `Reversal of journal entry ${journalEntry.entryNumber}. Reason: ${reason}`,
      relatedEntity: journalEntry.relatedEntity,
      createdBy: req.user.id, // From auth middleware
      status: JournalEntryStatus.POSTED,
      postedBy: req.user.id,
      postedAt: new Date(),
    });

    // Update account balances and create general ledger entries
    for (const item of reversingEntry.items) {
      const account = await Account.findById(item.account);
      
      if (!account) {
        throw new AppError(`Account with ID ${item.account} not found`, 404);
      }

      // Update account balance
      const netAmount = (item.debit || 0) - (item.credit || 0);
      account.balance += netAmount;
      await account.save();

      // Create general ledger entry
      await GeneralLedger.create({
        account: item.account,
        journalEntry: reversingEntry._id,
        date: reversingEntry.date,
        description: item.description || reversingEntry.description,
        debit: item.debit || 0,
        credit: item.credit || 0,
        balance: account.balance,
        reference: reversingEntry.reference,
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        originalEntry: journalEntry,
        reversingEntry,
      },
    });
  }
);
