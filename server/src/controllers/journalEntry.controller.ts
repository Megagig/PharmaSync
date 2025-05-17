import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import JournalEntry from '../models/journalEntry.model';
import Account from '../models/account.model';
import GeneralLedger from '../models/generalLedger.model';
import { JournalEntryStatus } from '../interfaces/accounting.interface';
import { AppError } from '../utils/error';
import logger from '../utils/logger';
import { redisClient } from '../config/redis';
import { toObjectId } from '../utils/idConverter';

/**
 * @desc    Get all journal entries with pagination and filtering
 * @route   GET /api/accounting/journal-entries
 * @access  Private
 */
export const getJournalEntries = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter: any = {};

      // Filter by status
      if (req.query.status) {
        filter.status = req.query.status;
      }

      // Filter by date range
      if (req.query.startDate && req.query.endDate) {
        filter.date = {
          $gte: new Date(req.query.startDate as string),
          $lte: new Date(req.query.endDate as string),
        };
      }

      // Filter by reference number
      if (req.query.reference) {
        filter.referenceNumber = {
          $regex: req.query.reference,
          $options: 'i',
        };
      }

      // Get total count
      const total = await JournalEntry.countDocuments(filter);

      // Get entries with pagination
      const entries = await JournalEntry.find(filter)
        .populate('entries.account', 'accountNumber name')
        .populate('createdBy', 'firstName lastName')
        .populate('postedBy', 'firstName lastName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      // Cache the results
      if (redisClient.isOpen) {
        const cacheKey = `journal:entries:${JSON.stringify(
          filter
        )}:${page}:${limit}`;
        await redisClient.setEx(
          cacheKey,
          300,
          JSON.stringify({ entries, total })
        ); // Cache for 5 minutes
      }

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
    } catch (error) {
      logger.error('Error in getJournalEntries:', error);
      throw new AppError('Failed to fetch journal entries', 500);
    }
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        date,
        referenceNumber,
        description,
        entries,
        notes,
        attachments,
      } = req.body;

      // Validate entries
      if (!Array.isArray(entries) || entries.length < 2) {
        throw new AppError('At least two entries are required', 400);
      }

      // Calculate total debits and credits
      const totals = entries.reduce(
        (acc, entry) => {
          acc.debits += entry.debit || 0;
          acc.credits += entry.credit || 0;
          return acc;
        },
        { debits: 0, credits: 0 }
      );

      // Check if debits equal credits
      if (Math.abs(totals.debits - totals.credits) > 0.01) {
        throw new AppError('Total debits must equal total credits', 400);
      }

      // Validate accounts and check permissions
      for (const entry of entries) {
        const account = await Account.findById(entry.account).session(session);
        if (!account) {
          throw new AppError(`Account not found: ${entry.account}`, 404);
        }

        if (account.isLocked) {
          throw new AppError(`Account is locked: ${account.name}`, 400);
        }

        if (account.status !== 'active') {
          throw new AppError(`Account is not active: ${account.name}`, 400);
        }
      }

      // Generate reference number if not provided
      const journalRef = referenceNumber || (await generateReferenceNumber());

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        [
          {
            date: date || new Date(),
            referenceNumber: journalRef,
            description,
            entries,
            notes,
            attachments,
            status: JournalEntryStatus.DRAFT,
            createdBy: req.user.id,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Clear cache
      if (redisClient.isOpen) {
        await redisClient.del('journal:entries:latest');
        for (const entry of entries) {
          await redisClient.del(`account:${entry.account}:balance`);
        }
      }

      res.status(201).json({
        status: 'success',
        data: journalEntry[0],
      });
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error in createJournalEntry:', error);
      throw error;
    } finally {
      session.endSession();
    }
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
      const totalDebit = items.reduce(
        (sum: number, item: any) => sum + (item.debit || 0),
        0
      );
      const totalCredit = items.reduce(
        (sum: number, item: any) => sum + (item.credit || 0),
        0
      );

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
    if (recurringEndDate)
      journalEntry.recurringEndDate = new Date(recurringEndDate);
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
    await journalEntry.deleteOne();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Post journal entry
 * @route   PATCH /api/accounting/journal-entries/:id/post
 * @access  Private
 */
export const postJournalEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const journalEntry = await JournalEntry.findById(req.params.id).session(
        session
      );

      if (!journalEntry) {
        throw new AppError('Journal entry not found', 404);
      }

      if (journalEntry.status === JournalEntryStatus.POSTED) {
        throw new AppError('Journal entry is already posted', 400);
      }

      // Update account balances
      for (const entry of journalEntry.items) {
        const account = await Account.findById(entry.account).session(session);
        if (!account) {
          throw new AppError(`Account not found: ${entry.account}`, 404);
        }

        if (account.isLocked) {
          throw new AppError(`Account is locked: ${account.name}`, 400);
        }

        // Update balance
        account.balance += (entry.debit || 0) - (entry.credit || 0);
        await account.save({ session });
      }

      // Update journal entry status
      journalEntry.status = JournalEntryStatus.POSTED;
      journalEntry.postedBy = toObjectId(req.user.id);
      journalEntry.postedAt = new Date();
      await journalEntry.save({ session });

      await session.commitTransaction();

      // Clear cache
      if (redisClient.isOpen) {
        await redisClient.del('journal:entries:latest');
        for (const entry of journalEntry.items) {
          await redisClient.del(`account:${entry.account}:balance`);
        }
      }

      res.status(200).json({
        status: 'success',
        data: journalEntry,
      });
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error in postJournalEntry:', error);
      throw error;
    } finally {
      session.endSession();
    }
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
    journalEntry.reversedBy = toObjectId(req.user.id); // From auth middleware
    journalEntry.reversedAt = new Date();
    journalEntry.notes = journalEntry.notes
      ? `${journalEntry.notes}\n\nReversed: ${reason}`
      : `Reversed: ${reason}`;

    await journalEntry.save();

    // Create reversing journal entry
    const reversingItems = journalEntry.items.map((item) => ({
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

/**
 * Generate unique reference number for journal entries
 */
const generateReferenceNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `JE${year}${month}`;

  const lastEntry = await JournalEntry.findOne({
    referenceNumber: new RegExp(`^${prefix}`),
  })
    .sort({ referenceNumber: -1 })
    .select('referenceNumber');

  const sequence = lastEntry
    ? parseInt(lastEntry.entryNumber.slice(-4)) + 1
    : 1;

  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};
