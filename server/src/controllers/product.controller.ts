import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/product.model';
import { AppError } from '../utils/error';
import { IProduct } from '../interfaces/product.interface';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Private
 */
export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const searchTerm = req.query.search as string;
  const type = req.query.type as string;
  const category = req.query.category as string;
  const isActive = req.query.isActive as string;
  
  // Build query
  const query: any = {};
  
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { sku: { $regex: searchTerm, $options: 'i' } },
      { barcode: { $regex: searchTerm, $options: 'i' } },
      { brand: { $regex: searchTerm, $options: 'i' } },
    ];
  }
  
  if (type) {
    query.type = type;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  // Execute query
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      products,
      meta: {
        totalProducts,
        totalPages,
        currentPage: page,
      },
    },
  });
});

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Private
 */
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: product,
  });
});

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private
 */
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    sku,
    barcode,
    description,
    type,
    category,
    brand,
    manufacturer,
    requiresPrescription,
    defaultPrice,
    priceLevels,
    minimumStockLevel,
    maximumStockLevel,
    reorderPoint,
    reorderQuantity,
    isActive,
    isTaxable,
    taxRate,
    notes,
    medicationId,
    images,
    tags,
  } = req.body;
  
  // Check if product with same SKU or barcode already exists
  if (sku) {
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      throw new AppError('Product with this SKU already exists', 400);
    }
  }
  
  if (barcode) {
    const existingProduct = await Product.findOne({ barcode });
    if (existingProduct) {
      throw new AppError('Product with this barcode already exists', 400);
    }
  }
  
  // Create product
  const product = await Product.create({
    name,
    sku,
    barcode,
    description,
    type,
    category,
    brand,
    manufacturer,
    requiresPrescription: requiresPrescription || false,
    defaultPrice,
    priceLevels: priceLevels || [],
    minimumStockLevel: minimumStockLevel || 10,
    maximumStockLevel,
    reorderPoint: reorderPoint || 5,
    reorderQuantity,
    isActive: isActive !== undefined ? isActive : true,
    isTaxable: isTaxable !== undefined ? isTaxable : true,
    taxRate,
    notes,
    medicationId,
    images: images || [],
    tags: tags || [],
    createdBy: req.user._id,
  });
  
  res.status(201).json({
    status: 'success',
    data: product,
  });
});

/**
 * @desc    Update product
 * @route   PATCH /api/products/:id
 * @access  Private
 */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  // Check if SKU or barcode is being changed and if it already exists
  if (req.body.sku && req.body.sku !== product.sku) {
    const existingProduct = await Product.findOne({ sku: req.body.sku });
    if (existingProduct) {
      throw new AppError('Product with this SKU already exists', 400);
    }
  }
  
  if (req.body.barcode && req.body.barcode !== product.barcode) {
    const existingProduct = await Product.findOne({ barcode: req.body.barcode });
    if (existingProduct) {
      throw new AppError('Product with this barcode already exists', 400);
    }
  }
  
  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: updatedProduct,
  });
});

/**
 * @desc    Delete product (soft delete by setting isActive to false)
 * @route   DELETE /api/products/:id
 * @access  Private
 */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  product.isActive = false;
  await product.save();
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Add inventory item to product
 * @route   POST /api/products/:id/inventory
 * @access  Private
 */
export const addInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  const { batchNumber, expiryDate, quantity, location, costPrice } = req.body;
  
  // Check if batch already exists
  const batchExists = product.inventory.some(item => item.batchNumber === batchNumber);
  if (batchExists) {
    throw new AppError('Batch number already exists for this product', 400);
  }
  
  // Add inventory item
  product.inventory.push({
    batchNumber,
    expiryDate: new Date(expiryDate),
    quantity,
    location,
    costPrice,
  });
  
  await product.save();
  
  res.status(201).json({
    status: 'success',
    data: product,
  });
});

/**
 * @desc    Update inventory item
 * @route   PATCH /api/products/:id/inventory/:itemId
 * @access  Private
 */
export const updateInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  const inventoryItem = product.inventory.id(req.params.itemId);
  
  if (!inventoryItem) {
    throw new AppError('Inventory item not found', 404);
  }
  
  // Update inventory item fields
  Object.keys(req.body).forEach(key => {
    if (key === 'expiryDate') {
      inventoryItem[key] = new Date(req.body[key]);
    } else {
      inventoryItem[key] = req.body[key];
    }
  });
  
  await product.save();
  
  res.status(200).json({
    status: 'success',
    data: product,
  });
});

/**
 * @desc    Remove inventory item
 * @route   DELETE /api/products/:id/inventory/:itemId
 * @access  Private
 */
export const removeInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  const inventoryItem = product.inventory.id(req.params.itemId);
  
  if (!inventoryItem) {
    throw new AppError('Inventory item not found', 404);
  }
  
  inventoryItem.remove();
  await product.save();
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Add price level to product
 * @route   POST /api/products/:id/price-levels
 * @access  Private
 */
export const addPriceLevel = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  const { name, price } = req.body;
  
  // Check if price level already exists
  const priceLevelExists = product.priceLevels.some(level => level.name === name);
  if (priceLevelExists) {
    throw new AppError('Price level already exists for this product', 400);
  }
  
  // Add price level
  product.priceLevels.push({
    name,
    price,
  });
  
  await product.save();
  
  res.status(201).json({
    status: 'success',
    data: product,
  });
});

/**
 * @desc    Update price level
 * @route   PATCH /api/products/:id/price-levels/:levelId
 * @access  Private
 */
export const updatePriceLevel = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  const priceLevel = product.priceLevels.id(req.params.levelId);
  
  if (!priceLevel) {
    throw new AppError('Price level not found', 404);
  }
  
  // Update price level fields
  Object.keys(req.body).forEach(key => {
    priceLevel[key] = req.body[key];
  });
  
  await product.save();
  
  res.status(200).json({
    status: 'success',
    data: product,
  });
});

/**
 * @desc    Remove price level
 * @route   DELETE /api/products/:id/price-levels/:levelId
 * @access  Private
 */
export const removePriceLevel = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  const priceLevel = product.priceLevels.id(req.params.levelId);
  
  if (!priceLevel) {
    throw new AppError('Price level not found', 404);
  }
  
  priceLevel.remove();
  await product.save();
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});
