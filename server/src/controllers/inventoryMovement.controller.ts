import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import InventoryMovement from '../models/inventoryMovement.model';
import Product from '../models/product.model';
import Location from '../models/location.model';
import { AppError } from '../utils/error';
import { MovementType } from '../interfaces/inventoryMovement.interface';

/**
 * @desc    Get all inventory movements
 * @route   GET /api/inventory/movements
 * @access  Private
 */
export const getAllInventoryMovements = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const searchTerm = req.query.search as string;
  const type = req.query.type as string;
  const status = req.query.status as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const sourceLocation = req.query.sourceLocation as string;
  const destinationLocation = req.query.destinationLocation as string;
  
  // Build query
  const query: any = {};
  
  if (searchTerm) {
    query.$or = [
      { referenceNumber: { $regex: searchTerm, $options: 'i' } },
      { notes: { $regex: searchTerm, $options: 'i' } },
    ];
  }
  
  if (type) {
    query.type = type;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    query.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.date = { $lte: new Date(endDate) };
  }
  
  if (sourceLocation) {
    query.sourceLocation = sourceLocation;
  }
  
  if (destinationLocation) {
    query.destinationLocation = destinationLocation;
  }
  
  // Execute query
  const movements = await InventoryMovement.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sourceLocation', 'name')
    .populate('destinationLocation', 'name')
    .populate('createdBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .populate('items.product', 'name sku');
  
  const totalMovements = await InventoryMovement.countDocuments(query);
  const totalPages = Math.ceil(totalMovements / limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      movements,
      meta: {
        totalMovements,
        totalPages,
        currentPage: page,
      },
    },
  });
});

/**
 * @desc    Get inventory movement by ID
 * @route   GET /api/inventory/movements/:id
 * @access  Private
 */
export const getInventoryMovementById = asyncHandler(async (req: Request, res: Response) => {
  const movement = await InventoryMovement.findById(req.params.id)
    .populate('sourceLocation', 'name')
    .populate('destinationLocation', 'name')
    .populate('createdBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .populate('items.product', 'name sku');
  
  if (!movement) {
    throw new AppError('Inventory movement not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: movement,
  });
});

/**
 * @desc    Create new inventory movement
 * @route   POST /api/inventory/movements
 * @access  Private
 */
export const createInventoryMovement = asyncHandler(async (req: Request, res: Response) => {
  const {
    referenceNumber,
    type,
    date,
    sourceLocation,
    destinationLocation,
    items,
    notes,
  } = req.body;
  
  // Validate source location
  const sourceLocationDoc = await Location.findById(sourceLocation);
  if (!sourceLocationDoc) {
    throw new AppError('Source location not found', 404);
  }
  
  // Validate destination location if it's a transfer
  if (type === MovementType.TRANSFER) {
    if (!destinationLocation) {
      throw new AppError('Destination location is required for transfers', 400);
    }
    
    const destinationLocationDoc = await Location.findById(destinationLocation);
    if (!destinationLocationDoc) {
      throw new AppError('Destination location not found', 404);
    }
    
    if (sourceLocation === destinationLocation) {
      throw new AppError('Source and destination locations cannot be the same', 400);
    }
  }
  
  // Validate items
  if (!items || items.length === 0) {
    throw new AppError('At least one item is required', 400);
  }
  
  // Validate each item
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new AppError(`Product with ID ${item.product} not found`, 404);
    }
    
    if (item.quantity <= 0) {
      throw new AppError('Quantity must be greater than zero', 400);
    }
    
    // For outgoing movements, check if there's enough stock
    if (
      type === MovementType.SALE ||
      type === MovementType.TRANSFER ||
      type === MovementType.ADJUSTMENT ||
      type === MovementType.EXPIRY ||
      type === MovementType.DAMAGE ||
      type === MovementType.THEFT
    ) {
      // Find the batch in the product inventory
      const batch = product.inventory.find(
        inv => inv.batchNumber === item.batchNumber && inv.location === sourceLocation
      );
      
      if (!batch) {
        throw new AppError(`Batch ${item.batchNumber} not found for product ${product.name}`, 404);
      }
      
      if (batch.quantity < item.quantity) {
        throw new AppError(`Not enough stock for product ${product.name} batch ${item.batchNumber}`, 400);
      }
    }
  }
  
  // Create inventory movement
  const movement = await InventoryMovement.create({
    referenceNumber,
    type,
    date: date ? new Date(date) : new Date(),
    sourceLocation,
    destinationLocation,
    items,
    notes,
    status: 'pending',
    createdBy: req.user._id,
  });
  
  res.status(201).json({
    status: 'success',
    data: movement,
  });
});

/**
 * @desc    Update inventory movement
 * @route   PATCH /api/inventory/movements/:id
 * @access  Private
 */
export const updateInventoryMovement = asyncHandler(async (req: Request, res: Response) => {
  const movement = await InventoryMovement.findById(req.params.id);
  
  if (!movement) {
    throw new AppError('Inventory movement not found', 404);
  }
  
  // Only allow updates if status is pending
  if (movement.status !== 'pending') {
    throw new AppError('Cannot update movement that is not in pending status', 400);
  }
  
  // Update movement
  const updatedMovement = await InventoryMovement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: updatedMovement,
  });
});

/**
 * @desc    Approve inventory movement
 * @route   PATCH /api/inventory/movements/:id/approve
 * @access  Private
 */
export const approveInventoryMovement = asyncHandler(async (req: Request, res: Response) => {
  const movement = await InventoryMovement.findById(req.params.id);
  
  if (!movement) {
    throw new AppError('Inventory movement not found', 404);
  }
  
  // Only allow approval if status is pending
  if (movement.status !== 'pending') {
    throw new AppError('Cannot approve movement that is not in pending status', 400);
  }
  
  // Update movement status
  movement.status = 'approved';
  movement.approvedBy = req.user._id;
  await movement.save();
  
  res.status(200).json({
    status: 'success',
    data: movement,
  });
});

/**
 * @desc    Complete inventory movement (apply inventory changes)
 * @route   PATCH /api/inventory/movements/:id/complete
 * @access  Private
 */
export const completeInventoryMovement = asyncHandler(async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const movement = await InventoryMovement.findById(req.params.id).session(session);
    
    if (!movement) {
      throw new AppError('Inventory movement not found', 404);
    }
    
    // Only allow completion if status is approved
    if (movement.status !== 'approved') {
      throw new AppError('Cannot complete movement that is not in approved status', 400);
    }
    
    // Process each item in the movement
    for (const item of movement.items) {
      const product = await Product.findById(item.product).session(session);
      
      if (!product) {
        throw new AppError(`Product with ID ${item.product} not found`, 404);
      }
      
      switch (movement.type) {
        case MovementType.PURCHASE:
          // Add to inventory
          const existingBatch = product.inventory.find(
            inv => inv.batchNumber === item.batchNumber && inv.location === movement.sourceLocation.toString()
          );
          
          if (existingBatch) {
            // Update existing batch
            existingBatch.quantity += item.quantity;
          } else {
            // Add new batch
            product.inventory.push({
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate || new Date(),
              quantity: item.quantity,
              location: movement.sourceLocation.toString(),
              costPrice: item.costPrice,
            });
          }
          break;
          
        case MovementType.SALE:
        case MovementType.EXPIRY:
        case MovementType.DAMAGE:
        case MovementType.THEFT:
        case MovementType.OTHER:
          // Reduce inventory
          const sourceBatch = product.inventory.find(
            inv => inv.batchNumber === item.batchNumber && inv.location === movement.sourceLocation.toString()
          );
          
          if (!sourceBatch) {
            throw new AppError(`Batch ${item.batchNumber} not found for product ${product.name}`, 404);
          }
          
          if (sourceBatch.quantity < item.quantity) {
            throw new AppError(`Not enough stock for product ${product.name} batch ${item.batchNumber}`, 400);
          }
          
          sourceBatch.quantity -= item.quantity;
          
          // Remove batch if quantity is zero
          if (sourceBatch.quantity === 0) {
            product.inventory = product.inventory.filter(
              inv => !(inv.batchNumber === item.batchNumber && inv.location === movement.sourceLocation.toString())
            );
          }
          break;
          
        case MovementType.TRANSFER:
          // Reduce from source location
          const sourceTransferBatch = product.inventory.find(
            inv => inv.batchNumber === item.batchNumber && inv.location === movement.sourceLocation.toString()
          );
          
          if (!sourceTransferBatch) {
            throw new AppError(`Batch ${item.batchNumber} not found for product ${product.name} in source location`, 404);
          }
          
          if (sourceTransferBatch.quantity < item.quantity) {
            throw new AppError(`Not enough stock for product ${product.name} batch ${item.batchNumber} in source location`, 400);
          }
          
          sourceTransferBatch.quantity -= item.quantity;
          
          // Remove batch if quantity is zero
          if (sourceTransferBatch.quantity === 0) {
            product.inventory = product.inventory.filter(
              inv => !(inv.batchNumber === item.batchNumber && inv.location === movement.sourceLocation.toString())
            );
          }
          
          // Add to destination location
          const destBatch = product.inventory.find(
            inv => inv.batchNumber === item.batchNumber && inv.location === movement.destinationLocation.toString()
          );
          
          if (destBatch) {
            // Update existing batch
            destBatch.quantity += item.quantity;
          } else {
            // Add new batch
            product.inventory.push({
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate || sourceTransferBatch.expiryDate,
              quantity: item.quantity,
              location: movement.destinationLocation.toString(),
              costPrice: item.costPrice || sourceTransferBatch.costPrice,
            });
          }
          break;
          
        case MovementType.ADJUSTMENT:
          // Handle adjustment (could be positive or negative)
          const adjustBatch = product.inventory.find(
            inv => inv.batchNumber === item.batchNumber && inv.location === movement.sourceLocation.toString()
          );
          
          if (!adjustBatch) {
            // If batch doesn't exist, create it (for positive adjustment)
            if (item.quantity > 0) {
              product.inventory.push({
                batchNumber: item.batchNumber,
                expiryDate: item.expiryDate || new Date(),
                quantity: item.quantity,
                location: movement.sourceLocation.toString(),
                costPrice: item.costPrice,
              });
            } else {
              throw new AppError(`Batch ${item.batchNumber} not found for product ${product.name}`, 404);
            }
          } else {
            // Update existing batch
            adjustBatch.quantity += item.quantity;
            
            // Remove batch if quantity is zero or negative
            if (adjustBatch.quantity <= 0) {
              product.inventory = product.inventory.filter(
                inv => !(inv.batchNumber === item.batchNumber && inv.location === movement.sourceLocation.toString())
              );
            }
          }
          break;
          
        case MovementType.RETURN:
          // Add to inventory (similar to purchase)
          const returnBatch = product.inventory.find(
            inv => inv.batchNumber === item.batchNumber && inv.location === movement.sourceLocation.toString()
          );
          
          if (returnBatch) {
            // Update existing batch
            returnBatch.quantity += item.quantity;
          } else {
            // Add new batch
            product.inventory.push({
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate || new Date(),
              quantity: item.quantity,
              location: movement.sourceLocation.toString(),
              costPrice: item.costPrice,
            });
          }
          break;
      }
      
      await product.save({ session });
    }
    
    // Update movement status
    movement.status = 'completed';
    await movement.save({ session });
    
    await session.commitTransaction();
    
    res.status(200).json({
      status: 'success',
      data: movement,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Cancel inventory movement
 * @route   PATCH /api/inventory/movements/:id/cancel
 * @access  Private
 */
export const cancelInventoryMovement = asyncHandler(async (req: Request, res: Response) => {
  const movement = await InventoryMovement.findById(req.params.id);
  
  if (!movement) {
    throw new AppError('Inventory movement not found', 404);
  }
  
  // Only allow cancellation if status is pending or approved
  if (movement.status === 'completed') {
    throw new AppError('Cannot cancel movement that is already completed', 400);
  }
  
  // Update movement status
  movement.status = 'cancelled';
  await movement.save();
  
  res.status(200).json({
    status: 'success',
    data: movement,
  });
});
