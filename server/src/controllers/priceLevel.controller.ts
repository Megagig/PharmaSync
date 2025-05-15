import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import PriceLevel from '../models/priceLevel.model';
import { AppError } from '../utils/error';

/**
 * @desc    Get all price levels
 * @route   GET /api/price-levels
 * @access  Private
 */
export const getAllPriceLevels = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const searchTerm = req.query.search as string;
  const isActive = req.query.isActive as string;
  
  // Build query
  const query: any = {};
  
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { code: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
    ];
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  // Execute query
  const priceLevels = await PriceLevel.find(query)
    .sort({ isDefault: -1, name: 1 })
    .skip(skip)
    .limit(limit);
  
  const totalPriceLevels = await PriceLevel.countDocuments(query);
  const totalPages = Math.ceil(totalPriceLevels / limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      priceLevels,
      meta: {
        totalPriceLevels,
        totalPages,
        currentPage: page,
      },
    },
  });
});

/**
 * @desc    Get all active price levels (no pagination)
 * @route   GET /api/price-levels/active
 * @access  Private
 */
export const getAllActivePriceLevels = asyncHandler(async (req: Request, res: Response) => {
  const priceLevels = await PriceLevel.find({ isActive: true })
    .sort({ isDefault: -1, name: 1 });
  
  res.status(200).json({
    status: 'success',
    data: priceLevels,
  });
});

/**
 * @desc    Get price level by ID
 * @route   GET /api/price-levels/:id
 * @access  Private
 */
export const getPriceLevelById = asyncHandler(async (req: Request, res: Response) => {
  const priceLevel = await PriceLevel.findById(req.params.id);
  
  if (!priceLevel) {
    throw new AppError('Price level not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: priceLevel,
  });
});

/**
 * @desc    Create new price level
 * @route   POST /api/price-levels
 * @access  Private
 */
export const createPriceLevel = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    code,
    description,
    markupPercentage,
    markdownPercentage,
    isDefault,
    isActive,
  } = req.body;
  
  // Check if price level with same name or code already exists
  const existingPriceLevelByName = await PriceLevel.findOne({ name });
  if (existingPriceLevelByName) {
    throw new AppError('Price level with this name already exists', 400);
  }
  
  if (code) {
    const existingPriceLevelByCode = await PriceLevel.findOne({ code });
    if (existingPriceLevelByCode) {
      throw new AppError('Price level with this code already exists', 400);
    }
  }
  
  // Create price level
  const priceLevel = await PriceLevel.create({
    name,
    code,
    description,
    markupPercentage,
    markdownPercentage,
    isDefault: isDefault !== undefined ? isDefault : false,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.user._id,
  });
  
  res.status(201).json({
    status: 'success',
    data: priceLevel,
  });
});

/**
 * @desc    Update price level
 * @route   PATCH /api/price-levels/:id
 * @access  Private
 */
export const updatePriceLevel = asyncHandler(async (req: Request, res: Response) => {
  const priceLevel = await PriceLevel.findById(req.params.id);
  
  if (!priceLevel) {
    throw new AppError('Price level not found', 404);
  }
  
  // Check if name is being changed and if it already exists
  if (req.body.name && req.body.name !== priceLevel.name) {
    const existingPriceLevel = await PriceLevel.findOne({ name: req.body.name });
    if (existingPriceLevel) {
      throw new AppError('Price level with this name already exists', 400);
    }
  }
  
  // Check if code is being changed and if it already exists
  if (req.body.code && req.body.code !== priceLevel.code) {
    const existingPriceLevel = await PriceLevel.findOne({ code: req.body.code });
    if (existingPriceLevel) {
      throw new AppError('Price level with this code already exists', 400);
    }
  }
  
  // Update price level
  const updatedPriceLevel = await PriceLevel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: updatedPriceLevel,
  });
});

/**
 * @desc    Delete price level (soft delete by setting isActive to false)
 * @route   DELETE /api/price-levels/:id
 * @access  Private
 */
export const deletePriceLevel = asyncHandler(async (req: Request, res: Response) => {
  const priceLevel = await PriceLevel.findById(req.params.id);
  
  if (!priceLevel) {
    throw new AppError('Price level not found', 404);
  }
  
  // Don't allow deleting the default price level
  if (priceLevel.isDefault) {
    throw new AppError('Cannot delete the default price level', 400);
  }
  
  priceLevel.isActive = false;
  await priceLevel.save();
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Set price level as default
 * @route   PATCH /api/price-levels/:id/set-default
 * @access  Private
 */
export const setPriceLevelAsDefault = asyncHandler(async (req: Request, res: Response) => {
  const priceLevel = await PriceLevel.findById(req.params.id);
  
  if (!priceLevel) {
    throw new AppError('Price level not found', 404);
  }
  
  // Don't allow setting inactive price level as default
  if (!priceLevel.isActive) {
    throw new AppError('Cannot set inactive price level as default', 400);
  }
  
  // Update all price levels to not be default
  await PriceLevel.updateMany({}, { isDefault: false });
  
  // Set this price level as default
  priceLevel.isDefault = true;
  await priceLevel.save();
  
  res.status(200).json({
    status: 'success',
    data: priceLevel,
  });
});
