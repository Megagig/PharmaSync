import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Supplier from '../models/supplier.model';
import { AppError } from '../utils/error';

/**
 * @desc    Get all suppliers with pagination and filtering
 * @route   GET /api/suppliers
 * @access  Private
 */
export const getAllSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter: any = {};
  
  // Filter by active status
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  
  // Filter by preferred supplier
  if (req.query.preferredSupplier !== undefined) {
    filter.preferredSupplier = req.query.preferredSupplier === 'true';
  }
  
  // Search by name or supplier code
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { supplierCode: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  
  // Filter by category
  if (req.query.category) {
    filter.categories = { $in: [req.query.category] };
  }
  
  // Execute query with pagination
  const suppliers = await Supplier.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Supplier.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    data: suppliers,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get supplier by ID
 * @route   GET /api/suppliers/:id
 * @access  Private
 */
export const getSupplierById = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: supplier,
  });
});

/**
 * @desc    Create new supplier
 * @route   POST /api/suppliers
 * @access  Private
 */
export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    contactPerson,
    email,
    phone,
    address,
    taxId,
    paymentTerms,
    notes,
    preferredSupplier,
    supplierCode,
    categories,
  } = req.body;
  
  // Check if supplier with same email already exists
  const existingSupplier = await Supplier.findOne({ email });
  
  if (existingSupplier) {
    throw new AppError('Supplier with this email already exists', 400);
  }
  
  // Create supplier
  const supplier = await Supplier.create({
    name,
    contactPerson,
    email,
    phone,
    address,
    taxId,
    paymentTerms,
    notes,
    preferredSupplier,
    supplierCode,
    categories,
  });
  
  res.status(201).json({
    status: 'success',
    data: supplier,
  });
});

/**
 * @desc    Update supplier
 * @route   PATCH /api/suppliers/:id
 * @access  Private
 */
export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    contactPerson,
    email,
    phone,
    address,
    taxId,
    paymentTerms,
    notes,
    isActive,
    preferredSupplier,
    categories,
  } = req.body;
  
  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }
  
  // Check if email is being changed and if it already exists
  if (email && email !== supplier.email) {
    const existingSupplier = await Supplier.findOne({ email });
    
    if (existingSupplier) {
      throw new AppError('Supplier with this email already exists', 400);
    }
  }
  
  // Update fields
  if (name) supplier.name = name;
  if (contactPerson) supplier.contactPerson = contactPerson;
  if (email) supplier.email = email;
  if (phone) supplier.phone = phone;
  if (address) {
    if (address.street) supplier.address.street = address.street;
    if (address.city) supplier.address.city = address.city;
    if (address.state) supplier.address.state = address.state;
    if (address.postalCode) supplier.address.postalCode = address.postalCode;
    if (address.country) supplier.address.country = address.country;
  }
  if (taxId !== undefined) supplier.taxId = taxId;
  if (paymentTerms) supplier.paymentTerms = paymentTerms;
  if (notes !== undefined) supplier.notes = notes;
  if (isActive !== undefined) supplier.isActive = isActive;
  if (preferredSupplier !== undefined) supplier.preferredSupplier = preferredSupplier;
  if (categories) supplier.categories = categories;
  
  await supplier.save();
  
  res.status(200).json({
    status: 'success',
    data: supplier,
  });
});

/**
 * @desc    Delete supplier (soft delete by setting isActive to false)
 * @route   DELETE /api/suppliers/:id
 * @access  Private
 */
export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }
  
  // Soft delete by setting isActive to false
  supplier.isActive = false;
  await supplier.save();
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});
