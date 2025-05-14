import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Dispensing from '../models/dispensing.model';
import Patient from '../models/patient.model';
import Medication from '../models/medication.model';
import { DispensingStatus } from '../interfaces/dispensing.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all dispensing records with pagination and filtering
 * @route   GET /api/dispensing
 * @access  Private
 */
export const getAllDispensing = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter: any = {};
  
  // Filter by patient
  if (req.query.patient) {
    filter.patient = req.query.patient;
  }
  
  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    filter.dispensingDate = {
      $gte: new Date(req.query.startDate as string),
      $lte: new Date(req.query.endDate as string),
    };
  }
  
  // Search by dispensing number
  if (req.query.search) {
    filter.dispensingNumber = { $regex: req.query.search, $options: 'i' };
  }
  
  // Execute query with pagination
  const dispensingRecords = await Dispensing.find(filter)
    .populate('patient', 'firstName lastName')
    .populate('dispensedBy', 'firstName lastName')
    .populate('prescription', 'prescriptionNumber')
    .sort({ dispensingDate: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Dispensing.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    data: dispensingRecords,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get dispensing record by ID
 * @route   GET /api/dispensing/:id
 * @access  Private
 */
export const getDispensingById = asyncHandler(async (req: Request, res: Response) => {
  const dispensing = await Dispensing.findById(req.params.id)
    .populate('patient')
    .populate('dispensedBy', 'firstName lastName email')
    .populate('prescription', 'prescriptionNumber prescriptionDate')
    .populate({
      path: 'items.medication',
      select: 'name genericName brandName strength dosageForm type',
    });
  
  if (!dispensing) {
    throw new AppError('Dispensing record not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: dispensing,
  });
});

/**
 * @desc    Create new dispensing record
 * @route   POST /api/dispensing
 * @access  Private
 */
export const createDispensing = asyncHandler(async (req: Request, res: Response) => {
  const { patient, prescription, dispensingDate, items, paymentMethod, discount, tax, notes } = req.body;
  
  // Verify patient exists
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    throw new AppError('Patient not found', 404);
  }
  
  // Process each item
  const processedItems = [];
  let subtotal = 0;
  
  for (const item of items) {
    const { medication, quantity, batchNumber, unitPrice } = item;
    
    // Verify medication exists
    const medicationDoc = await Medication.findById(medication);
    if (!medicationDoc) {
      throw new AppError(`Medication with ID ${medication} not found`, 404);
    }
    
    // Find the inventory item with the specified batch number
    const inventoryItem = medicationDoc.inventory.find(inv => inv.batchNumber === batchNumber);
    
    if (!inventoryItem) {
      throw new AppError(`Inventory item with batch number ${batchNumber} not found`, 404);
    }
    
    // Check if there's enough quantity
    if (inventoryItem.quantity < quantity) {
      throw new AppError(`Insufficient quantity in inventory for batch ${batchNumber}`, 400);
    }
    
    // Update inventory quantity
    inventoryItem.quantity -= quantity;
    
    // Update medication total stock
    medicationDoc.totalStock -= quantity;
    
    await medicationDoc.save();
    
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
  const total = subtotal - discountAmount + taxAmount;
  
  // Create dispensing record
  const dispensing = await Dispensing.create({
    patient,
    prescription,
    dispensedBy: req.user.id, // From auth middleware
    dispensingDate: dispensingDate || new Date(),
    items: processedItems,
    paymentMethod: paymentMethod || 'cash',
    subtotal,
    discount: discountAmount,
    tax: taxAmount,
    total,
    notes,
  });
  
  res.status(201).json({
    status: 'success',
    data: dispensing,
  });
});

/**
 * @desc    Update dispensing record
 * @route   PATCH /api/dispensing/:id
 * @access  Private
 */
export const updateDispensing = asyncHandler(async (req: Request, res: Response) => {
  const { status, paymentMethod, discount, tax, notes, receiptGenerated } = req.body;
  
  const dispensing = await Dispensing.findById(req.params.id);
  
  if (!dispensing) {
    throw new AppError('Dispensing record not found', 404);
  }
  
  // Update fields
  if (status) dispensing.status = status;
  if (paymentMethod) dispensing.paymentMethod = paymentMethod;
  if (discount !== undefined) {
    dispensing.discount = discount;
    dispensing.total = dispensing.subtotal - discount + dispensing.tax;
  }
  if (tax !== undefined) {
    dispensing.tax = tax;
    dispensing.total = dispensing.subtotal - dispensing.discount + tax;
  }
  if (notes !== undefined) dispensing.notes = notes;
  if (receiptGenerated !== undefined) dispensing.receiptGenerated = receiptGenerated;
  
  await dispensing.save();
  
  res.status(200).json({
    status: 'success',
    data: dispensing,
  });
});

/**
 * @desc    Generate receipt for dispensing
 * @route   POST /api/dispensing/:id/receipt
 * @access  Private
 */
export const generateReceipt = asyncHandler(async (req: Request, res: Response) => {
  const dispensing = await Dispensing.findById(req.params.id)
    .populate('patient', 'firstName lastName')
    .populate('dispensedBy', 'firstName lastName')
    .populate({
      path: 'items.medication',
      select: 'name genericName brandName strength dosageForm',
    });
  
  if (!dispensing) {
    throw new AppError('Dispensing record not found', 404);
  }
  
  // Mark receipt as generated
  dispensing.receiptGenerated = true;
  await dispensing.save();
  
  // Format receipt data
  const receiptData = {
    dispensingNumber: dispensing.dispensingNumber,
    date: dispensing.dispensingDate,
    patient: {
      name: `${dispensing.patient.firstName} ${dispensing.patient.lastName}`,
      id: dispensing.patient._id,
    },
    dispensedBy: `${dispensing.dispensedBy.firstName} ${dispensing.dispensedBy.lastName}`,
    items: dispensing.items.map(item => ({
      medication: typeof item.medication === 'object' 
        ? `${item.medication.name} ${item.medication.strength} ${item.medication.dosageForm}`
        : 'Unknown Medication',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
    subtotal: dispensing.subtotal,
    discount: dispensing.discount,
    tax: dispensing.tax,
    total: dispensing.total,
    paymentMethod: dispensing.paymentMethod,
  };
  
  res.status(200).json({
    status: 'success',
    data: receiptData,
  });
});

/**
 * @desc    Process return of dispensed items
 * @route   POST /api/dispensing/:id/return
 * @access  Private
 */
export const returnDispensing = asyncHandler(async (req: Request, res: Response) => {
  const { reason, items } = req.body;
  const { id } = req.params;
  
  const dispensing = await Dispensing.findById(id);
  
  if (!dispensing) {
    throw new AppError('Dispensing record not found', 404);
  }
  
  // Check if dispensing is already returned or cancelled
  if (dispensing.status !== DispensingStatus.COMPLETED) {
    throw new AppError(`Cannot return a dispensing with status: ${dispensing.status}`, 400);
  }
  
  // Process each returned item
  for (const returnedItem of items) {
    const { itemId, quantity } = returnedItem;
    
    // Find the dispensing item
    const dispensingItem = dispensing.items.id(itemId);
    
    if (!dispensingItem) {
      throw new AppError(`Dispensing item with ID ${itemId} not found`, 404);
    }
    
    // Check if return quantity is valid
    if (quantity > dispensingItem.quantity) {
      throw new AppError(`Return quantity exceeds dispensed quantity for item ${itemId}`, 400);
    }
    
    // Update medication inventory
    const medication = await Medication.findById(dispensingItem.medication);
    
    if (!medication) {
      throw new AppError('Medication not found', 404);
    }
    
    // Find the inventory item with the specified batch number
    const inventoryItem = medication.inventory.find(item => item.batchNumber === dispensingItem.batchNumber);
    
    if (!inventoryItem) {
      // If batch no longer exists, create a new inventory item
      medication.inventory.push({
        batchNumber: dispensingItem.batchNumber,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
        quantity,
        unitPrice: dispensingItem.unitPrice,
        purchaseDate: new Date(),
      });
    } else {
      // Update existing inventory item
      inventoryItem.quantity += quantity;
    }
    
    // Update medication total stock
    medication.totalStock += quantity;
    
    await medication.save();
  }
  
  // Update dispensing status
  dispensing.status = DispensingStatus.RETURNED;
  dispensing.notes = dispensing.notes 
    ? `${dispensing.notes}\n\nRETURNED: ${reason}` 
    : `RETURNED: ${reason}`;
  
  await dispensing.save();
  
  res.status(200).json({
    status: 'success',
    data: dispensing,
  });
});
