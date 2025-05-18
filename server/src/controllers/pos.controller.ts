import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { AppError } from '../utils/error';
import * as posService from '../services/pos.service';
import logger from '../utils/logger';

/**
 * @desc    Create a new sale
 * @route   POST /api/pos/sales
 * @access  Private
 */
export const createSale = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { items, customer, paymentMethod, notes } = req.body;

        // Validate request body
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new AppError('Sale items are required', 400);
        }

        if (!paymentMethod) {
            throw new AppError('Payment method is required', 400);
        }

        // Create sale using service
        const sale = await posService.createSale({
            items,
            customer,
            paymentMethod,
            notes,
            userId: req.user._id,
            location: req.body.location || '000000000000000000000000', // Default location if not provided
        });

        res.status(201).json({
            status: 'success',
            data: sale,
        });
    } catch (error) {
        logger.error('Error in createSale controller:', error);
        next(error);
    }
});

/**
 * @desc    Void a sale
 * @route   PATCH /api/pos/sales/:id/void
 * @access  Private
 */
export const voidSale = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { reason } = req.body;

        if (!reason) {
            throw new AppError('Void reason is required', 400);
        }

        const sale = await posService.voidSale(req.params.id, req.user._id, reason);

        res.status(200).json({
            status: 'success',
            data: sale,
        });
    } catch (error) {
        logger.error('Error in voidSale controller:', error);
        next(error);
    }
});

/**
 * @desc    Get sale by ID
 * @route   GET /api/pos/sales/:id
 * @access  Private
 */
export const getSaleById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sale = await posService.getSaleById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: sale,
        });
    } catch (error) {
        logger.error('Error in getSaleById controller:', error);
        next(error);
    }
});

/**
 * @desc    Get sales with pagination and filtering
 * @route   GET /api/pos/sales
 * @access  Private
 */
export const getSales = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {
            page,
            limit,
            startDate,
            endDate,
            customer,
            status,
            minAmount,
            maxAmount,
        } = req.query;

        const result = await posService.getSales({
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            customer: customer as string,
            status: status as any,
            minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
            maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
        });

        res.status(200).json({
            status: 'success',
            data: result.sales,
            meta: result.meta,
        });
    } catch (error) {
        logger.error('Error in getSales controller:', error);
        next(error);
    }
});