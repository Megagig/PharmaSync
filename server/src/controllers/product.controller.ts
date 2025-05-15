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
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Private
 */
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: product,
    });
  }
);

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private
 */
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
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
      sku: sku || undefined, // If sku is empty or null, it will be undefined and the pre-validate hook will generate it
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
  }
);

/**
 * @desc    Update product
 * @route   PATCH /api/products/:id
 * @access  Private
 */
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
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
      const existingProduct = await Product.findOne({
        barcode: req.body.barcode,
      });
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
  }
);

/**
 * @desc    Delete product (soft delete by setting isActive to false)
 * @route   DELETE /api/products/:id
 * @access  Private
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

/**
 * @desc    Add inventory item to product
 * @route   POST /api/products/:id/inventory
 * @access  Private
 */
export const addInventoryItem = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const { batchNumber, expiryDate, quantity, location, costPrice } = req.body;

    // Check if batch already exists
    const batchExists = product.inventory.some(
      (item) => item.batchNumber === batchNumber
    );
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
  }
);

/**
 * @desc    Update inventory item
 * @route   PATCH /api/products/:id/inventory/:itemId
 * @access  Private
 */
export const updateInventoryItem = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const inventoryItem = product.inventory.find(
      (item) => item._id?.toString() === req.params.itemId
    );

    if (!inventoryItem) {
      throw new AppError('Inventory item not found', 404);
    }

    // Update inventory item fields
    const { batchNumber, quantity, location, costPrice, expiryDate } = req.body;

    if (batchNumber !== undefined) {
      inventoryItem.batchNumber = batchNumber;
    }

    if (quantity !== undefined) {
      inventoryItem.quantity = quantity;
    }

    if (location !== undefined) {
      inventoryItem.location = location;
    }

    if (costPrice !== undefined) {
      inventoryItem.costPrice = costPrice;
    }

    if (expiryDate !== undefined) {
      inventoryItem.expiryDate = new Date(expiryDate);
    }

    await product.save();

    res.status(200).json({
      status: 'success',
      data: product,
    });
  }
);

/**
 * @desc    Remove inventory item
 * @route   DELETE /api/products/:id/inventory/:itemId
 * @access  Private
 */
export const removeInventoryItem = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const inventoryItem = product.inventory.find(
      (item) => item._id?.toString() === req.params.itemId
    );

    if (!inventoryItem) {
      throw new AppError('Inventory item not found', 404);
    }

    // Remove the inventory item from the array
    product.inventory = product.inventory.filter(
      (item) => item._id?.toString() !== req.params.itemId
    );
    await product.save();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Add price level to product
 * @route   POST /api/products/:id/price-levels
 * @access  Private
 */
export const addPriceLevel = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const { name, price } = req.body;

    // Check if price level already exists
    const priceLevelExists = product.priceLevels.some(
      (level) => level.name === name
    );
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
  }
);

/**
 * @desc    Update price level
 * @route   PATCH /api/products/:id/price-levels/:levelId
 * @access  Private
 */
export const updatePriceLevel = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const priceLevel = product.priceLevels.find(
      (level) => level._id?.toString() === req.params.levelId
    );

    if (!priceLevel) {
      throw new AppError('Price level not found', 404);
    }

    // Update price level fields
    const { name, price } = req.body;

    if (name !== undefined) {
      priceLevel.name = name;
    }

    if (price !== undefined) {
      priceLevel.price = price;
    }

    await product.save();

    res.status(200).json({
      status: 'success',
      data: product,
    });
  }
);

/**
 * @desc    Remove price level
 * @route   DELETE /api/products/:id/price-levels/:levelId
 * @access  Private
 */
export const removePriceLevel = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const priceLevel = product.priceLevels.find(
      (level) => level._id?.toString() === req.params.levelId
    );

    if (!priceLevel) {
      throw new AppError('Price level not found', 404);
    }

    // Remove the price level from the array
    product.priceLevels = product.priceLevels.filter(
      (level) => level._id?.toString() !== req.params.levelId
    );
    await product.save();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Get product history
 * @route   GET /api/products/:id/history
 * @access  Private
 */
export const getProductHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // For now, we'll return a mock history
    // In a real implementation, you would fetch from a history/audit log collection
    const mockHistory = [
      {
        _id: '1',
        type: 'create',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        quantity: product.totalStock || 0,
        user: {
          _id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
        notes: 'Product created',
      },
      {
        _id: '2',
        type: 'update',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        quantity: 0,
        user: {
          _id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
        notes: 'Product details updated',
      },
    ];

    // Add inventory items as history entries
    const inventoryHistory = product.inventory.map((item, index) => ({
      _id: `inv-${index}`,
      type: 'purchase',
      date: new Date(
        Date.now() - (10 - index) * 24 * 60 * 60 * 1000
      ).toISOString(),
      quantity: item.quantity,
      batchNumber: item.batchNumber,
      location: item.location,
      costPrice: item.costPrice,
      user: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      },
      notes: `Inventory batch ${item.batchNumber} added`,
    }));

    const history = [...mockHistory, ...inventoryHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.status(200).json({
      status: 'success',
      data: history,
    });
  }
);
