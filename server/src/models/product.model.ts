import mongoose, { Schema } from 'mongoose';
import {
  IProduct,
  ProductType,
  ProductCategory,
} from '../interfaces/product.interface';
import { generateSKU } from '../utils/helpers';

const productInventoryItemSchema = new Schema(
  {
    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const productPriceLevelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
    },
    barcode: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(ProductType),
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      required: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    requiresPrescription: {
      type: Boolean,
      required: true,
      default: false,
    },
    inventory: [productInventoryItemSchema],
    salesPriceLevels: [productPriceLevelSchema],
    purchasePriceLevels: [productPriceLevelSchema],
    defaultSalesPrice: { type: Number, required: true, min: 0 },
    defaultPurchasePrice: { type: Number, required: true, min: 0 },
    minimumStockLevel: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
    },
    maximumStockLevel: {
      type: Number,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
    },
    reorderQuantity: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isTaxable: {
      type: Boolean,
      default: true,
    },
    taxRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      trim: true,
    },
    medicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Medication',
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
productSchema.index({ name: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ type: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ 'inventory.expiryDate': 1 });

// Virtual for total stock
productSchema.virtual('totalStock').get(function (this: IProduct) {
  return this.inventory.reduce((total, item) => total + item.quantity, 0);
});

// Generate SKU before validation if not provided
productSchema.pre('validate', function (next) {
  const doc = this as any;
  if (!doc.sku) {
    // Format: PT-XXXXX (where PT is product type prefix and XXXXX is a sequential number)
    const typePrefix = doc.type.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    doc.sku = `${typePrefix}-${randomNum}`;
  }
  next();
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
