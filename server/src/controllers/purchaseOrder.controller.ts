import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import PurchaseOrder from '../models/purchaseOrder.model';
import Supplier from '../models/supplier.model';
import Medication from '../models/medication.model';
import { PurchaseOrderStatus } from '../interfaces/purchaseOrder.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all purchase orders with pagination and filtering
 * @route   GET /api/purchase-orders
 * @access  Private
 */
export const getAllPurchaseOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by supplier
    if (req.query.supplier) {
      filter.supplier = req.query.supplier;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.orderDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Search by order number
    if (req.query.search) {
      filter.orderNumber = { $regex: req.query.search, $options: 'i' };
    }

    // Execute query with pagination
    const purchaseOrders = await PurchaseOrder.find(filter)
      .populate('supplier', 'name supplierCode')
      .populate('createdBy', 'firstName lastName')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await PurchaseOrder.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: purchaseOrders,
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
 * @desc    Get purchase order by ID
 * @route   GET /api/purchase-orders/:id
 * @access  Private
 */
export const getPurchaseOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('supplier')
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('receivedBy', 'firstName lastName email')
      .populate({
        path: 'items.medication',
        select: 'name genericName brandName strength dosageForm',
      });

    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: purchaseOrder,
    });
  }
);

/**
 * @desc    Create new purchase order
 * @route   POST /api/purchase-orders
 * @access  Private
 */
export const createPurchaseOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      supplier,
      orderDate,
      expectedDeliveryDate,
      items,
      discount,
      tax,
      shippingCost,
      paymentTerms,
      notes,
    } = req.body;

    // Verify supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      throw new AppError('Supplier not found', 404);
    }

    // Process each item
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { medication, quantity, unitPrice } = item;

      // Verify medication exists
      const medicationExists = await Medication.findById(medication);
      if (!medicationExists) {
        throw new AppError(`Medication with ID ${medication} not found`, 404);
      }

      // Calculate item subtotal
      const itemSubtotal = quantity * unitPrice;
      subtotal += itemSubtotal;

      // Add to processed items
      processedItems.push({
        ...item,
        subtotal: itemSubtotal,
      });
    }

    // Calculate total
    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const shippingAmount = shippingCost || 0;
    const total = subtotal - discountAmount + taxAmount + shippingAmount;

    // Create purchase order
    const purchaseOrder = await PurchaseOrder.create({
      supplier,
      orderDate: orderDate || new Date(),
      expectedDeliveryDate,
      items: processedItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      shippingCost: shippingAmount,
      total,
      paymentTerms: paymentTerms || supplierExists.paymentTerms,
      notes,
      createdBy: req.user.id, // From auth middleware
    });

    res.status(201).json({
      status: 'success',
      data: purchaseOrder,
    });
  }
);

/**
 * @desc    Update purchase order
 * @route   PATCH /api/purchase-orders/:id
 * @access  Private
 */
export const updatePurchaseOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      expectedDeliveryDate,
      status,
      discount,
      tax,
      shippingCost,
      paymentTerms,
      paymentStatus,
      notes,
    } = req.body;

    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    // Check if purchase order can be updated
    if (
      purchaseOrder.status === PurchaseOrderStatus.RECEIVED ||
      purchaseOrder.status === PurchaseOrderStatus.CANCELLED
    ) {
      throw new AppError(
        `Cannot update a purchase order with status: ${purchaseOrder.status}`,
        400
      );
    }

    // Update fields
    if (expectedDeliveryDate)
      purchaseOrder.expectedDeliveryDate = new Date(expectedDeliveryDate);
    if (status) purchaseOrder.status = status;
    if (discount !== undefined) {
      purchaseOrder.discount = discount;
      purchaseOrder.total =
        purchaseOrder.subtotal -
        discount +
        purchaseOrder.tax +
        purchaseOrder.shippingCost;
    }
    if (tax !== undefined) {
      purchaseOrder.tax = tax;
      purchaseOrder.total =
        purchaseOrder.subtotal -
        purchaseOrder.discount +
        tax +
        purchaseOrder.shippingCost;
    }
    if (shippingCost !== undefined) {
      purchaseOrder.shippingCost = shippingCost;
      purchaseOrder.total =
        purchaseOrder.subtotal -
        purchaseOrder.discount +
        purchaseOrder.tax +
        shippingCost;
    }
    if (paymentTerms) purchaseOrder.paymentTerms = paymentTerms;
    if (paymentStatus) purchaseOrder.paymentStatus = paymentStatus;
    if (notes !== undefined) purchaseOrder.notes = notes;

    await purchaseOrder.save();

    res.status(200).json({
      status: 'success',
      data: purchaseOrder,
    });
  }
);

/**
 * @desc    Add item to purchase order
 * @route   POST /api/purchase-orders/:id/items
 * @access  Private
 */
export const addPurchaseOrderItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { medication, quantity, unitPrice, notes } = req.body;

    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    // Check if purchase order can be updated
    if (
      purchaseOrder.status !== PurchaseOrderStatus.DRAFT &&
      purchaseOrder.status !== PurchaseOrderStatus.PENDING
    ) {
      throw new AppError(
        `Cannot add items to a purchase order with status: ${purchaseOrder.status}`,
        400
      );
    }

    // Verify medication exists
    const medicationExists = await Medication.findById(medication);
    if (!medicationExists) {
      throw new AppError(`Medication with ID ${medication} not found`, 404);
    }

    // Calculate item subtotal
    const subtotal = quantity * unitPrice;

    // Add item to purchase order
    purchaseOrder.items.push({
      medication,
      quantity,
      unitPrice,
      subtotal,
      notes,
    });

    // Update purchase order subtotal and total
    purchaseOrder.subtotal += subtotal;
    purchaseOrder.total =
      purchaseOrder.subtotal -
      purchaseOrder.discount +
      purchaseOrder.tax +
      purchaseOrder.shippingCost;

    await purchaseOrder.save();

    res.status(200).json({
      status: 'success',
      data: purchaseOrder,
    });
  }
);

/**
 * @desc    Update purchase order item
 * @route   PATCH /api/purchase-orders/:id/items/:itemId
 * @access  Private
 */
export const updatePurchaseOrderItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { quantity, unitPrice, notes } = req.body;
    const { id, itemId } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    // Check if purchase order can be updated
    if (
      purchaseOrder.status !== PurchaseOrderStatus.DRAFT &&
      purchaseOrder.status !== PurchaseOrderStatus.PENDING
    ) {
      throw new AppError(
        `Cannot update items in a purchase order with status: ${purchaseOrder.status}`,
        400
      );
    }

    // Find the item
    const item = purchaseOrder.items.find(
      (item) => item._id.toString() === itemId
    );

    if (!item) {
      throw new AppError('Purchase order item not found', 404);
    }

    // Calculate old and new subtotals
    const oldSubtotal = item.subtotal;

    // Update fields
    if (quantity !== undefined) item.quantity = quantity;
    if (unitPrice !== undefined) item.unitPrice = unitPrice;
    if (notes !== undefined) item.notes = notes;

    // Recalculate item subtotal
    item.subtotal = item.quantity * item.unitPrice;

    // Update purchase order subtotal and total
    purchaseOrder.subtotal =
      purchaseOrder.subtotal - oldSubtotal + item.subtotal;
    purchaseOrder.total =
      purchaseOrder.subtotal -
      purchaseOrder.discount +
      purchaseOrder.tax +
      purchaseOrder.shippingCost;

    await purchaseOrder.save();

    res.status(200).json({
      status: 'success',
      data: purchaseOrder,
    });
  }
);

/**
 * @desc    Remove purchase order item
 * @route   DELETE /api/purchase-orders/:id/items/:itemId
 * @access  Private
 */
export const removePurchaseOrderItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, itemId } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    // Check if purchase order can be updated
    if (
      purchaseOrder.status !== PurchaseOrderStatus.DRAFT &&
      purchaseOrder.status !== PurchaseOrderStatus.PENDING
    ) {
      throw new AppError(
        `Cannot remove items from a purchase order with status: ${purchaseOrder.status}`,
        400
      );
    }

    // Find the item
    const item = purchaseOrder.items.find(
      (item) => item._id.toString() === itemId
    );

    if (!item) {
      throw new AppError('Purchase order item not found', 404);
    }

    // Update purchase order subtotal and total
    purchaseOrder.subtotal -= item.subtotal;
    purchaseOrder.total =
      purchaseOrder.subtotal -
      purchaseOrder.discount +
      purchaseOrder.tax +
      purchaseOrder.shippingCost;

    // Find the index of the item to remove
    const itemIndex = purchaseOrder.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    // Remove the item using splice
    if (itemIndex !== -1) {
      purchaseOrder.items.splice(itemIndex, 1);
    }

    await purchaseOrder.save();

    res.status(200).json({
      status: 'success',
      data: purchaseOrder,
    });
  }
);

/**
 * @desc    Approve purchase order
 * @route   PATCH /api/purchase-orders/:id/approve
 * @access  Private
 */
export const approvePurchaseOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    // Check if purchase order can be approved
    if (purchaseOrder.status !== PurchaseOrderStatus.PENDING) {
      throw new AppError(
        `Cannot approve a purchase order with status: ${purchaseOrder.status}`,
        400
      );
    }

    // Update status and approver
    purchaseOrder.status = PurchaseOrderStatus.APPROVED;
    purchaseOrder.approvedBy = req.user.id; // From auth middleware

    await purchaseOrder.save();

    res.status(200).json({
      status: 'success',
      data: purchaseOrder,
    });
  }
);

/**
 * @desc    Mark purchase order as ordered
 * @route   PATCH /api/purchase-orders/:id/order
 * @access  Private
 */
export const markAsOrdered = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    // Check if purchase order can be marked as ordered
    if (purchaseOrder.status !== PurchaseOrderStatus.APPROVED) {
      throw new AppError(
        `Cannot mark as ordered a purchase order with status: ${purchaseOrder.status}`,
        400
      );
    }

    // Update status
    purchaseOrder.status = PurchaseOrderStatus.ORDERED;

    await purchaseOrder.save();

    res.status(200).json({
      status: 'success',
      data: purchaseOrder,
    });
  }
);

/**
 * @desc    Receive purchase order
 * @route   POST /api/purchase-orders/:id/receive
 * @access  Private
 */
export const receivePurchaseOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { deliveryDate, items, notes } = req.body;
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    // Check if purchase order can be received
    if (
      purchaseOrder.status !== PurchaseOrderStatus.ORDERED &&
      purchaseOrder.status !== PurchaseOrderStatus.PARTIAL
    ) {
      throw new AppError(
        `Cannot receive a purchase order with status: ${purchaseOrder.status}`,
        400
      );
    }

    // Process each received item
    let allItemsReceived = true;

    for (const receivedItem of items) {
      const { itemId, receivedQuantity, batchNumber, expiryDate } =
        receivedItem;

      // Find the purchase order item
      const purchaseOrderItem = purchaseOrder.items.find(
        (item) => item._id.toString() === itemId
      );

      if (!purchaseOrderItem) {
        throw new AppError(
          `Purchase order item with ID ${itemId} not found`,
          404
        );
      }

      // Update received quantity
      const newReceivedQuantity =
        (purchaseOrderItem.receivedQuantity || 0) + receivedQuantity;

      if (newReceivedQuantity > purchaseOrderItem.quantity) {
        throw new AppError(
          `Received quantity exceeds ordered quantity for item ${itemId}`,
          400
        );
      }

      purchaseOrderItem.receivedQuantity = newReceivedQuantity;
      purchaseOrderItem.batchNumber = batchNumber;
      purchaseOrderItem.expiryDate = new Date(expiryDate);

      // Check if all items are fully received
      if (newReceivedQuantity < purchaseOrderItem.quantity) {
        allItemsReceived = false;
      }

      // Update medication inventory
      const medication = await Medication.findById(
        purchaseOrderItem.medication
      );

      if (!medication) {
        throw new AppError('Medication not found', 404);
      }

      // Find if batch already exists
      const existingBatchIndex = medication.inventory.findIndex(
        (item) => item.batchNumber === batchNumber
      );

      if (existingBatchIndex >= 0) {
        // Update existing batch
        medication.inventory[existingBatchIndex].quantity += receivedQuantity;
      } else {
        // Add new batch
        medication.inventory.push({
          batchNumber,
          expiryDate: new Date(expiryDate),
          quantity: receivedQuantity,
          unitPrice: purchaseOrderItem.unitPrice,
          purchaseDate: new Date(),
        });
      }

      // Calculate total stock is handled by the medication model

      await medication.save();
    }

    // Update purchase order
    purchaseOrder.deliveryDate = deliveryDate
      ? new Date(deliveryDate)
      : new Date();
    purchaseOrder.status = allItemsReceived
      ? PurchaseOrderStatus.RECEIVED
      : PurchaseOrderStatus.PARTIAL;
    purchaseOrder.receivedBy = req.user.id; // From auth middleware

    if (notes) {
      purchaseOrder.notes = purchaseOrder.notes
        ? `${purchaseOrder.notes}\n\nReceived: ${notes}`
        : `Received: ${notes}`;
    }

    await purchaseOrder.save();

    res.status(200).json({
      status: 'success',
      data: purchaseOrder,
    });
  }
);

/**
 * @desc    Cancel purchase order
 * @route   PATCH /api/purchase-orders/:id/cancel
 * @access  Private
 */
export const cancelPurchaseOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { reason } = req.body;
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    // Check if purchase order can be cancelled
    if (
      purchaseOrder.status === PurchaseOrderStatus.RECEIVED ||
      purchaseOrder.status === PurchaseOrderStatus.CANCELLED
    ) {
      throw new AppError(
        `Cannot cancel a purchase order with status: ${purchaseOrder.status}`,
        400
      );
    }

    // Update status and add cancellation reason to notes
    purchaseOrder.status = PurchaseOrderStatus.CANCELLED;
    purchaseOrder.notes = purchaseOrder.notes
      ? `${purchaseOrder.notes}\n\nCancelled: ${reason}`
      : `Cancelled: ${reason}`;

    await purchaseOrder.save();

    res.status(200).json({
      status: 'success',
      data: purchaseOrder,
    });
  }
);
