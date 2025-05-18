import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import PosTransaction from '../models/posTransaction.model';
import { PosTransactionType, ReturnReason } from '../interfaces/posTransaction.interface';
import { AppError } from '../utils/error';
import * as returnService from '../services/return.service';

/**
 * Get returnable transactions for a customer
 * @route GET /api/pos/returns/customer/:customerId
 * @access Private
 */
export const getReturnableTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { days } = req.query;

    const returnableDays = days ? parseInt(days as string) : 30;

    const transactions = await returnService.getReturnableTransactions(
      customerId,
      returnableDays
    );

    res.status(200).json({
      status: 'success',
      data: transactions,
    });
  }
);

/**
 * Get transaction details for return
 * @route GET /api/pos/returns/transaction/:transactionId
 * @access Private
 */
export const getTransactionForReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const { transactionId } = req.params;

    const transaction = await PosTransaction.findById(transactionId)
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('items.product', 'name sku barcode')
      .populate('location', 'name')
      .populate('cashier', 'firstName lastName');

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Check if transaction has already been fully returned
    const existingReturn = await PosTransaction.findOne({
      originalSale: transactionId,
      transactionType: PosTransactionType.RETURN,
      status: 'completed',
    });

    if (existingReturn) {
      throw new AppError('This transaction has already been returned', 400);
    }

    // Get partial returns to check for remaining returnable items
    const partialReturns = await PosTransaction.find({
      originalSale: transactionId,
      transactionType: PosTransactionType.PARTIAL_RETURN,
      status: 'completed',
    }).select('returnedItems');

    // Set of returned item IDs
    const returnedItemIds = new Set();
    partialReturns.forEach(partialReturn => {
      (partialReturn.returnedItems || []).forEach(itemId => {
        returnedItemIds.add(itemId.toString());
      });
    });

    // Filter out items that have already been returned
    const returnableItems = transaction.items.filter(
      (item: any) => !returnedItemIds.has((item._id || '').toString())
    );

    // Only include transaction if it has returnable items
    if (returnableItems.length === 0) {
      throw new AppError('All items in this transaction have already been returned', 400);
    }

    const result = {
      ...transaction.toObject(),
      items: returnableItems,
      hasPartialReturns: returnedItemIds.size > 0,
    };

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Process a full return
 * @route POST /api/pos/returns/full
 * @access Private
 */
export const processFullReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      originalTransactionId,
      returnReason,
      returnReasonDetails,
      paymentMethods,
      notes,
    } = req.body;

    if (!originalTransactionId) {
      throw new AppError('Original transaction ID is required', 400);
    }

    if (!returnReason) {
      throw new AppError('Return reason is required', 400);
    }

    if (!Object.values(ReturnReason).includes(returnReason as ReturnReason)) {
      throw new AppError('Invalid return reason', 400);
    }

    const returnTransaction = await returnService.processFullReturn({
      originalTransactionId,
      returnReason,
      returnReasonDetails,
      paymentMethods,
      notes,
      userId: req.user._id,
    });

    res.status(200).json({
      status: 'success',
      data: returnTransaction,
    });
  }
);

/**
 * Process a partial return
 * @route POST /api/pos/returns/partial
 * @access Private
 */
export const processPartialReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      originalTransactionId,
      returnItems,
      returnReason,
      returnReasonDetails,
      paymentMethods,
      notes,
    } = req.body;

    if (!originalTransactionId) {
      throw new AppError('Original transaction ID is required', 400);
    }

    if (!returnItems || !Array.isArray(returnItems) || returnItems.length === 0) {
      throw new AppError('Return items are required', 400);
    }

    if (!returnReason) {
      throw new AppError('Return reason is required', 400);
    }

    if (!Object.values(ReturnReason).includes(returnReason as ReturnReason)) {
      throw new AppError('Invalid return reason', 400);
    }

    const returnTransaction = await returnService.processPartialReturn({
      originalTransactionId,
      returnItems,
      returnReason,
      returnReasonDetails,
      paymentMethods,
      notes,
      userId: req.user._id,
    });

    res.status(200).json({
      status: 'success',
      data: returnTransaction,
    });
  }
);

/**
 * Get return details
 * @route GET /api/pos/returns/:returnId
 * @access Private
 */
export const getReturnDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { returnId } = req.params;

    const returnTransaction = await PosTransaction.findById(returnId)
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('items.product', 'name sku barcode')
      .populate('location', 'name')
      .populate('cashier', 'firstName lastName')
      .populate('originalSale', 'saleNumber saleDate total');

    if (!returnTransaction) {
      throw new AppError('Return transaction not found', 404);
    }

    if (![PosTransactionType.RETURN, PosTransactionType.PARTIAL_RETURN].includes(returnTransaction.transactionType as PosTransactionType)) {
      throw new AppError('Transaction is not a return', 400);
    }

    res.status(200).json({
      status: 'success',
      data: returnTransaction,
    });
  }
);
