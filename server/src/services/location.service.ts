import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import Location from '../models/location.model';
import Product from '../models/product.model';
import PosTransaction from '../models/posTransaction.model';
import { redisClient } from '../config/redis';
import logger from '../utils/logger';

/**
 * Get all locations with filtering and pagination
 */
export const getLocations = async ({
  page = 1,
  limit = 10,
  search,
  status,
  sortBy = 'name',
  sortOrder = 'asc',
}) => {
  try {
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const locations = await Location.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Location.countDocuments(query);
    
    return {
      locations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getLocations:', error);
    throw error;
  }
};

/**
 * Get location by ID
 */
export const getLocationById = async (id: string) => {
  try {
    const location = await Location.findById(id);
    
    if (!location) {
      throw new AppError(`Location not found with ID: ${id}`, 404);
    }
    
    return location;
  } catch (error) {
    logger.error(`Error in getLocationById: ${error}`);
    throw error;
  }
};

/**
 * Create a new location
 */
export const createLocation = async (locationData: any, userId: string) => {
  try {
    // Check if location with same name already exists
    const existingLocation = await Location.findOne({ name: locationData.name });
    
    if (existingLocation) {
      throw new AppError(`Location with name '${locationData.name}' already exists`, 400);
    }
    
    // Create location
    const location = new Location({
      ...locationData,
      createdBy: userId,
    });
    
    await location.save();
    
    return location;
  } catch (error) {
    logger.error('Error in createLocation:', error);
    throw error;
  }
};

/**
 * Update a location
 */
export const updateLocation = async (id: string, updateData: any, userId: string) => {
  try {
    // Find location
    const location = await Location.findById(id);
    
    if (!location) {
      throw new AppError(`Location not found with ID: ${id}`, 404);
    }
    
    // Check if name is being updated and if it already exists
    if (updateData.name && updateData.name !== location.name) {
      const existingLocation = await Location.findOne({ name: updateData.name });
      
      if (existingLocation) {
        throw new AppError(`Location with name '${updateData.name}' already exists`, 400);
      }
    }
    
    // Update location
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        location[key] = updateData[key];
      }
    });
    
    location.updatedBy = userId;
    
    await location.save();
    
    return location;
  } catch (error) {
    logger.error(`Error in updateLocation: ${error}`);
    throw error;
  }
};

/**
 * Delete a location
 */
export const deleteLocation = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find location
    const location = await Location.findById(id).session(session);
    
    if (!location) {
      throw new AppError(`Location not found with ID: ${id}`, 404);
    }
    
    // Check if location is being used in products
    const productsUsingLocation = await Product.countDocuments({
      'inventory.location': id,
    }).session(session);
    
    if (productsUsingLocation > 0) {
      throw new AppError(
        `Cannot delete location as it is being used by ${productsUsingLocation} products`,
        400
      );
    }
    
    // Check if location is being used in transactions
    const transactionsUsingLocation = await PosTransaction.countDocuments({
      location: id,
    }).session(session);
    
    if (transactionsUsingLocation > 0) {
      throw new AppError(
        `Cannot delete location as it is being used by ${transactionsUsingLocation} transactions`,
        400
      );
    }
    
    // Delete location
    await Location.findByIdAndDelete(id).session(session);
    
    await session.commitTransaction();
    
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error in deleteLocation: ${error}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Transfer inventory between locations
 */
export const transferInventory = async ({
  sourceLocationId,
  destinationLocationId,
  productId,
  batchNumber,
  quantity,
  notes,
  userId,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Validate source location
    const sourceLocation = await Location.findById(sourceLocationId).session(session);
    if (!sourceLocation) {
      throw new AppError(`Source location not found with ID: ${sourceLocationId}`, 404);
    }
    
    // Validate destination location
    const destinationLocation = await Location.findById(destinationLocationId).session(session);
    if (!destinationLocation) {
      throw new AppError(`Destination location not found with ID: ${destinationLocationId}`, 404);
    }
    
    // Validate product
    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new AppError(`Product not found with ID: ${productId}`, 404);
    }
    
    // Find source batch
    const sourceBatchIndex = product.inventory.findIndex(
      inv => inv.batchNumber === batchNumber && inv.location.toString() === sourceLocationId
    );
    
    if (sourceBatchIndex === -1) {
      throw new AppError(
        `Batch ${batchNumber} not found at source location ${sourceLocation.name}`,
        404
      );
    }
    
    const sourceBatch = product.inventory[sourceBatchIndex];
    
    // Check if source has enough quantity
    if (sourceBatch.quantity < quantity) {
      throw new AppError(
        `Insufficient quantity at source location. Available: ${sourceBatch.quantity}, Requested: ${quantity}`,
        400
      );
    }
    
    // Find destination batch
    const destinationBatchIndex = product.inventory.findIndex(
      inv => inv.batchNumber === batchNumber && inv.location.toString() === destinationLocationId
    );
    
    // Update source batch
    product.inventory[sourceBatchIndex].quantity -= quantity;
    
    // Update or create destination batch
    if (destinationBatchIndex !== -1) {
      // Update existing batch
      product.inventory[destinationBatchIndex].quantity += quantity;
    } else {
      // Create new batch
      product.inventory.push({
        batchNumber,
        expiryDate: sourceBatch.expiryDate,
        quantity,
        location: destinationLocationId,
        costPrice: sourceBatch.costPrice,
      });
    }
    
    // Create inventory transfer record
    const transfer = new mongoose.model('InventoryTransfer', {
      product: productId,
      batchNumber,
      quantity,
      sourceLocation: sourceLocationId,
      destinationLocation: destinationLocationId,
      transferDate: new Date(),
      notes,
      createdBy: userId,
    });
    
    await transfer.save({ session });
    
    // Save product
    await product.save({ session });
    
    // Clear product cache
    if (redisClient.isOpen) {
      await redisClient.del(`product:${productId}:stock`);
    }
    
    await session.commitTransaction();
    
    return {
      success: true,
      transfer,
      product,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error in transferInventory: ${error}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get inventory by location
 */
export const getInventoryByLocation = async (locationId: string) => {
  try {
    // Validate location
    const location = await Location.findById(locationId);
    if (!location) {
      throw new AppError(`Location not found with ID: ${locationId}`, 404);
    }
    
    // Get products with inventory at this location
    const products = await Product.find({
      'inventory.location': locationId,
      'inventory.quantity': { $gt: 0 },
    }).populate('category', 'name');
    
    // Format inventory data
    const inventory = products.map(product => {
      const locationInventory = product.inventory.filter(
        inv => inv.location.toString() === locationId && inv.quantity > 0
      );
      
      return {
        product: {
          _id: product._id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          category: product.category,
        },
        batches: locationInventory.map(inv => ({
          batchNumber: inv.batchNumber,
          expiryDate: inv.expiryDate,
          quantity: inv.quantity,
          costPrice: inv.costPrice,
        })),
        totalQuantity: locationInventory.reduce((sum, inv) => sum + inv.quantity, 0),
        totalValue: locationInventory.reduce((sum, inv) => sum + (inv.quantity * inv.costPrice), 0),
      };
    });
    
    return {
      location,
      inventory,
      summary: {
        totalProducts: inventory.length,
        totalItems: inventory.reduce((sum, item) => sum + item.totalQuantity, 0),
        totalValue: inventory.reduce((sum, item) => sum + item.totalValue, 0),
      },
    };
  } catch (error) {
    logger.error(`Error in getInventoryByLocation: ${error}`);
    throw error;
  }
};

/**
 * Get sales by location
 */
export const getSalesByLocation = async ({
  locationId,
  startDate,
  endDate,
  period = 'daily',
}) => {
  try {
    // Validate location
    const location = await Location.findById(locationId);
    if (!location) {
      throw new AppError(`Location not found with ID: ${locationId}`, 404);
    }
    
    // Build query
    const query: any = {
      location: new mongoose.Types.ObjectId(locationId),
      transactionType: 'sale',
    };
    
    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.saleDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.saleDate = { $lte: new Date(endDate) };
    } else {
      // Default to last 30 days if no date range provided
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);
      
      query.saleDate = { $gte: defaultStartDate };
    }
    
    // Build date grouping based on period
    let dateFormat;
    
    switch (period) {
      case 'hourly':
        dateFormat = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
          day: { $dayOfMonth: '$saleDate' },
          hour: { $hour: '$saleDate' },
        };
        break;
      case 'daily':
        dateFormat = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
          day: { $dayOfMonth: '$saleDate' },
        };
        break;
      case 'weekly':
        dateFormat = {
          year: { $year: '$saleDate' },
          week: { $week: '$saleDate' },
        };
        break;
      case 'monthly':
        dateFormat = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
        };
        break;
      case 'yearly':
        dateFormat = {
          year: { $year: '$saleDate' },
        };
        break;
      default:
        dateFormat = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
          day: { $dayOfMonth: '$saleDate' },
        };
    }
    
    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: dateFormat,
          totalSales: { $sum: '$total' },
          count: { $sum: 1 },
          averageSale: { $avg: '$total' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 },
      },
    ];
    
    // Execute aggregation
    const salesByPeriod = await PosTransaction.aggregate(pipeline);
    
    // Format results for chart display
    const formattedSales = salesByPeriod.map(item => {
      let label;
      
      switch (period) {
        case 'hourly':
          label = `${item._id.year}-${item._id.month}-${item._id.day} ${item._id.hour}:00`;
          break;
        case 'daily':
          label = `${item._id.year}-${item._id.month}-${item._id.day}`;
          break;
        case 'weekly':
          label = `${item._id.year} W${item._id.week}`;
          break;
        case 'monthly':
          label = `${item._id.year}-${item._id.month}`;
          break;
        case 'yearly':
          label = `${item._id.year}`;
          break;
        default:
          label = `${item._id.year}-${item._id.month}-${item._id.day}`;
      }
      
      return {
        label,
        totalSales: item.totalSales,
        count: item.count,
        averageSale: item.averageSale,
      };
    });
    
    // Get total sales for the period
    const totalSales = formattedSales.reduce((sum, item) => sum + item.totalSales, 0);
    const totalCount = formattedSales.reduce((sum, item) => sum + item.count, 0);
    const averageSale = totalCount > 0 ? totalSales / totalCount : 0;
    
    return {
      location,
      salesByPeriod: formattedSales,
      summary: {
        totalSales,
        totalCount,
        averageSale,
        period,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    };
  } catch (error) {
    logger.error(`Error in getSalesByLocation: ${error}`);
    throw error;
  }
};
