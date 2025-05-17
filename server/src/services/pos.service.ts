import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import { redisClient } from '../config/redis';
import Sale from '../models/sale.model';
import Product from '../models/product.model';
import Customer from '../models/customer.model';
import { SaleStatus } from '../interfaces/sale.interface';
import logger from '../utils/logger';
import { toObjectId } from '../utils/idConverter';

interface SaleItem {
  product: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

interface CreateSaleParams {
  items: SaleItem[];
  customer?: string;
  paymentMethod: string;
  notes?: string;
  userId: string;
}

/**
 * Create a new sale with proper transaction handling
 */
export const createSale = async ({
  items,
  customer,
  paymentMethod,
  notes,
  userId,
}: CreateSaleParams) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate items and check stock
    const validatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new AppError(`Product not found: ${item.product}`, 404);
        }

        if (product.totalStock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product ${product.name}. Available: ${product.totalStock}`,
            400
          );
        }

        return {
          ...item,
          product,
          subtotal: item.quantity * item.unitPrice,
          finalPrice:
            item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100),
        };
      })
    );

    // Validate customer if provided
    let customerDoc;
    if (customer) {
      customerDoc = await Customer.findById(customer).session(session);
      if (!customerDoc) {
        throw new AppError(`Customer not found: ${customer}`, 404);
      }
    }

    // Calculate totals
    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const totalDiscount = validatedItems.reduce(
      (sum, item) => sum + (item.subtotal - item.finalPrice),
      0
    );
    const total = subtotal - totalDiscount;

    // Create sale
    const sale = await Sale.create(
      [
        {
          items: validatedItems.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            subtotal: item.subtotal,
            finalPrice: item.finalPrice,
          })),
          customer: customerDoc?._id,
          subtotal,
          totalDiscount,
          total,
          paymentMethod,
          notes,
          status: SaleStatus.COMPLETED,
          createdBy: userId,
          saleDate: new Date(),
        },
      ],
      { session }
    );

    // Update product stock
    await Promise.all(
      validatedItems.map(async (item) => {
        const product = item.product;
        product.totalStock -= item.quantity;
        await product.save({ session });

        // Clear product cache
        if (redisClient.isOpen) {
          await redisClient.del(`product:${product._id}:stock`);
        }
      })
    );

    // Update customer purchase history if applicable
    if (customerDoc) {
      customerDoc.totalPurchases = (customerDoc.totalPurchases || 0) + total;
      customerDoc.lastPurchaseDate = new Date();
      await customerDoc.save({ session });

      // Clear customer cache
      if (redisClient.isOpen) {
        await redisClient.del(`customer:${customerDoc._id}`);
      }
    }

    await session.commitTransaction();
    return sale[0];
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in createSale:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Void a sale with proper transaction handling
 */
export const voidSale = async (
  saleId: string,
  userId: string,
  reason: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(saleId).session(session);
    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    if (sale.status === SaleStatus.VOIDED) {
      throw new AppError('Sale is already voided', 400);
    }

    // Restore product stock
    await Promise.all(
      sale.items.map(async (item) => {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new AppError(`Product not found: ${item.product}`, 404);
        }

        product.totalStock += item.quantity;
        await product.save({ session });

        // Clear product cache
        if (redisClient.isOpen) {
          await redisClient.del(`product:${product._id}:stock`);
        }
      })
    );

    // Update customer purchase history if applicable
    if (sale.customer) {
      const customer = await Customer.findById(sale.customer).session(session);
      if (customer) {
        customer.totalPurchases = (customer.totalPurchases || 0) - sale.total;
        await customer.save({ session });

        // Clear customer cache
        if (redisClient.isOpen) {
          await redisClient.del(`customer:${customer._id}`);
        }
      }
    }

    // Update sale status
    sale.status = SaleStatus.VOIDED;
    sale.voidedBy = toObjectId(userId);
    sale.voidedAt = new Date();
    sale.voidReason = reason;
    await sale.save({ session });

    await session.commitTransaction();
    return sale;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in voidSale:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get sale by ID with caching
 */
export const getSaleById = async (saleId: string) => {
  try {
    // Try to get from cache
    if (redisClient.isOpen) {
      const cachedSale = await redisClient.get(`sale:${saleId}`);
      if (cachedSale) {
        return JSON.parse(cachedSale.toString());
      }
    }

    const sale = await Sale.findById(saleId)
      .populate('items.product', 'name sku')
      .populate('customer', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('voidedBy', 'firstName lastName');

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    // Cache the result
    if (redisClient.isOpen) {
      await redisClient.setEx(`sale:${saleId}`, 300, JSON.stringify(sale)); // Cache for 5 minutes
    }

    return sale;
  } catch (error) {
    logger.error('Error in getSaleById:', error);
    throw error;
  }
};

/**
 * Get sales with pagination and filtering
 */
export const getSales = async ({
  page = 1,
  limit = 10,
  startDate,
  endDate,
  customer,
  status,
  minAmount,
  maxAmount,
}: {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  customer?: string;
  status?: SaleStatus;
  minAmount?: number;
  maxAmount?: number;
}) => {
  try {
    const query: any = {};

    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = startDate;
      if (endDate) query.saleDate.$lte = endDate;
    }

    if (customer) query.customer = customer;
    if (status) query.status = status;
    if (minAmount || maxAmount) {
      query.total = {};
      if (minAmount) query.total.$gte = minAmount;
      if (maxAmount) query.total.$lte = maxAmount;
    }

    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('items.product', 'name sku')
        .populate('customer', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .sort({ saleDate: -1 })
        .skip(skip)
        .limit(limit),
      Sale.countDocuments(query),
    ]);

    return {
      sales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getSales:', error);
    throw error;
  }
};
