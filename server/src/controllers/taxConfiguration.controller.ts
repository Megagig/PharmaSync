import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import TaxConfiguration from '../models/taxConfiguration.model';
import Account from '../models/account.model';
import { AppError } from '../utils/error';

/**
 * @desc    Get all tax configurations
 * @route   GET /api/accounting/taxes
 * @access  Private
 */
export const getTaxConfigurations = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by type
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Filter by active status
    if (req.query.isActive) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Get total count
    const total = await TaxConfiguration.countDocuments(filter);

    // Get tax configurations with pagination
    const taxConfigurations = await TaxConfiguration.find(filter)
      .populate('accountId', 'accountNumber name')
      .populate('createdBy', 'firstName lastName')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: taxConfigurations,
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
 * @desc    Get tax configuration by ID
 * @route   GET /api/accounting/taxes/:id
 * @access  Private
 */
export const getTaxConfigurationById = asyncHandler(
  async (req: Request, res: Response) => {
    const taxConfiguration = await TaxConfiguration.findById(req.params.id)
      .populate('accountId', 'accountNumber name')
      .populate('createdBy', 'firstName lastName');

    if (!taxConfiguration) {
      throw new AppError('Tax configuration not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: taxConfiguration,
    });
  }
);

/**
 * @desc    Create new tax configuration
 * @route   POST /api/accounting/taxes
 * @access  Private
 */
export const createTaxConfiguration = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      type,
      rate,
      description,
      isActive,
      isDefault,
      accountId,
    } = req.body;

    // Check if tax configuration with the same name already exists
    const existingTaxConfig = await TaxConfiguration.findOne({ name });
    if (existingTaxConfig) {
      throw new AppError('Tax configuration with this name already exists', 400);
    }

    // Verify account exists if specified
    if (accountId) {
      const accountExists = await Account.findById(accountId);
      if (!accountExists) {
        throw new AppError('Account not found', 404);
      }
    }

    // If setting as default, unset any existing defaults of the same type
    if (isDefault) {
      await TaxConfiguration.updateMany(
        { type, isDefault: true },
        { isDefault: false }
      );
    }

    // Create tax configuration
    const taxConfiguration = await TaxConfiguration.create({
      name,
      type,
      rate,
      description,
      isActive: isActive !== undefined ? isActive : true,
      isDefault: isDefault !== undefined ? isDefault : false,
      accountId: accountId || undefined,
      createdBy: req.user.id, // From auth middleware
    });

    res.status(201).json({
      status: 'success',
      data: taxConfiguration,
    });
  }
);

/**
 * @desc    Update tax configuration
 * @route   PATCH /api/accounting/taxes/:id
 * @access  Private
 */
export const updateTaxConfiguration = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      type,
      rate,
      description,
      isActive,
      isDefault,
      accountId,
    } = req.body;

    const taxConfiguration = await TaxConfiguration.findById(req.params.id);

    if (!taxConfiguration) {
      throw new AppError('Tax configuration not found', 404);
    }

    // Check if tax configuration with the same name already exists (excluding this one)
    if (name && name !== taxConfiguration.name) {
      const existingTaxConfig = await TaxConfiguration.findOne({ name });
      if (existingTaxConfig) {
        throw new AppError('Tax configuration with this name already exists', 400);
      }
    }

    // Verify account exists if specified
    if (accountId) {
      const accountExists = await Account.findById(accountId);
      if (!accountExists) {
        throw new AppError('Account not found', 404);
      }
    }

    // If setting as default, unset any existing defaults of the same type
    if (isDefault && !taxConfiguration.isDefault) {
      await TaxConfiguration.updateMany(
        { type: type || taxConfiguration.type, isDefault: true },
        { isDefault: false }
      );
    }

    // Update fields
    if (name) taxConfiguration.name = name;
    if (type) taxConfiguration.type = type;
    if (rate !== undefined) taxConfiguration.rate = rate;
    if (description !== undefined) taxConfiguration.description = description;
    if (isActive !== undefined) taxConfiguration.isActive = isActive;
    if (isDefault !== undefined) taxConfiguration.isDefault = isDefault;
    if (accountId !== undefined) taxConfiguration.accountId = accountId || undefined;

    await taxConfiguration.save();

    res.status(200).json({
      status: 'success',
      data: taxConfiguration,
    });
  }
);

/**
 * @desc    Delete tax configuration
 * @route   DELETE /api/accounting/taxes/:id
 * @access  Private (Admin only)
 */
export const deleteTaxConfiguration = asyncHandler(
  async (req: Request, res: Response) => {
    const taxConfiguration = await TaxConfiguration.findById(req.params.id);

    if (!taxConfiguration) {
      throw new AppError('Tax configuration not found', 404);
    }

    // Delete tax configuration
    await taxConfiguration.remove();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);
