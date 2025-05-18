import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Location from '../models/location.model';
import { AppError } from '../utils/error';
import * as locationService from '../services/location.service';

/**
 * @desc    Get all locations
 * @route   GET /api/locations
 * @access  Private
 */
export const getAllLocations = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const searchTerm = req.query.search as string;
  const type = req.query.type as string;
  const isActive = req.query.isActive as string;

  // Build query
  const query: any = {};

  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { code: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (type) {
    query.type = type;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Execute query
  const locations = await Location.find(query)
    .sort({ isDefault: -1, name: 1 })
    .skip(skip)
    .limit(limit);

  const totalLocations = await Location.countDocuments(query);
  const totalPages = Math.ceil(totalLocations / limit);

  res.status(200).json({
    status: 'success',
    data: {
      locations,
      meta: {
        totalLocations,
        totalPages,
        currentPage: page,
      },
    },
  });
});

/**
 * @desc    Get all active locations (no pagination)
 * @route   GET /api/locations/active
 * @access  Private
 */
export const getAllActiveLocations = asyncHandler(async (req: Request, res: Response) => {
  const locations = await Location.find({ isActive: true })
    .sort({ isDefault: -1, name: 1 });

  res.status(200).json({
    status: 'success',
    data: locations,
  });
});

/**
 * @desc    Get location by ID
 * @route   GET /api/locations/:id
 * @access  Private
 */
export const getLocationById = asyncHandler(async (req: Request, res: Response) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    throw new AppError('Location not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: location,
  });
});

/**
 * @desc    Create new location
 * @route   POST /api/locations
 * @access  Private
 */
export const createLocation = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    code,
    type,
    address,
    phone,
    email,
    manager,
    isActive,
    isDefault,
    notes,
    parentLocation,
  } = req.body;

  // Check if location with same name or code already exists
  const existingLocationByName = await Location.findOne({ name });
  if (existingLocationByName) {
    throw new AppError('Location with this name already exists', 400);
  }

  if (code) {
    const existingLocationByCode = await Location.findOne({ code });
    if (existingLocationByCode) {
      throw new AppError('Location with this code already exists', 400);
    }
  }

  // Create location
  const location = await Location.create({
    name,
    code,
    type,
    address,
    phone,
    email,
    manager,
    isActive: isActive !== undefined ? isActive : true,
    isDefault: isDefault !== undefined ? isDefault : false,
    notes,
    parentLocation,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: location,
  });
});

/**
 * @desc    Update location
 * @route   PATCH /api/locations/:id
 * @access  Private
 */
export const updateLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    throw new AppError('Location not found', 404);
  }

  // Check if name is being changed and if it already exists
  if (req.body.name && req.body.name !== location.name) {
    const existingLocation = await Location.findOne({ name: req.body.name });
    if (existingLocation) {
      throw new AppError('Location with this name already exists', 400);
    }
  }

  // Check if code is being changed and if it already exists
  if (req.body.code && req.body.code !== location.code) {
    const existingLocation = await Location.findOne({ code: req.body.code });
    if (existingLocation) {
      throw new AppError('Location with this code already exists', 400);
    }
  }

  // Update location
  const updatedLocation = await Location.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: updatedLocation,
  });
});

/**
 * @desc    Delete location (soft delete by setting isActive to false)
 * @route   DELETE /api/locations/:id
 * @access  Private
 */
export const deleteLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    throw new AppError('Location not found', 404);
  }

  // Don't allow deleting the default location
  if (location.isDefault) {
    throw new AppError('Cannot delete the default location', 400);
  }

  location.isActive = false;
  await location.save();

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Set location as default
 * @route   PATCH /api/locations/:id/set-default
 * @access  Private
 */
export const setLocationAsDefault = asyncHandler(async (req: Request, res: Response) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    throw new AppError('Location not found', 404);
  }

  // Don't allow setting inactive location as default
  if (!location.isActive) {
    throw new AppError('Cannot set inactive location as default', 400);
  }

  // Update all locations to not be default
  await Location.updateMany({}, { isDefault: false });

  // Set this location as default
  location.isDefault = true;
  await location.save();

  res.status(200).json({
    status: 'success',
    data: location,
  });
});

/**
 * Transfer inventory between locations
 * @route POST /api/locations/transfer-inventory
 * @access Private
 */
export const transferInventory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      sourceLocationId,
      destinationLocationId,
      productId,
      batchNumber,
      quantity,
      notes,
    } = req.body;

    if (!sourceLocationId) {
      throw new AppError('Source location ID is required', 400);
    }

    if (!destinationLocationId) {
      throw new AppError('Destination location ID is required', 400);
    }

    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    if (!batchNumber) {
      throw new AppError('Batch number is required', 400);
    }

    if (!quantity || quantity <= 0) {
      throw new AppError('Valid quantity is required', 400);
    }

    const result = await locationService.transferInventory({
      sourceLocationId,
      destinationLocationId,
      productId,
      batchNumber,
      quantity,
      notes,
      userId: req.user._id,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Get inventory by location
 * @route GET /api/locations/:id/inventory
 * @access Private
 */
export const getInventoryByLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await locationService.getInventoryByLocation(id);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Get sales by location
 * @route GET /api/locations/:id/sales
 * @access Private
 */
export const getSalesByLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate, period } = req.query;

    const result = await locationService.getSalesByLocation({
      locationId: id,
      startDate: startDate as string,
      endDate: endDate as string,
      period: period as string,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);