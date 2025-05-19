import mongoose, { Schema } from 'mongoose';
import {
  ICustomer,
  CustomerType,
  HealthcareProfessionalType,
} from '../interfaces/customer.interface';

const customerAddressSchema = new Schema(
  {
    street: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    country: {
      type: String,
      required: false,
      trim: true,
      default: 'Nigeria',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const customerSchema = new Schema<ICustomer>(
  {
    customerNumber: {
      type: String,
      required: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(CustomerType),
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    healthcareProfessionalType: {
      type: String,
      enum: Object.values(HealthcareProfessionalType),
      required: function (this: ICustomer) {
        return this.type === CustomerType.HEALTHCARE_PROFESSIONAL;
      },
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addresses: [customerAddressSchema],
    organization: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    priceLevel: {
      type: String,
      required: true,
      default: 'retail',
      trim: true,
    },
    creditLimit: {
      type: Number,
      min: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    creditStatus: {
      type: String,
      enum: ['active', 'suspended', 'blocked'],
      default: 'active',
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
    },
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
customerSchema.index({ customerNumber: 1 });
customerSchema.index({ firstName: 1, lastName: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ type: 1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ patientId: 1 });

// Virtual for full name
customerSchema.virtual('fullName').get(function (this: ICustomer) {
  return `${this.firstName} ${this.lastName}`;
});

// Generate customer number before saving if not provided
customerSchema.pre('save', function (next) {
  if (!this.customerNumber) {
    // Format: CT-XXXXX (where CT is customer type prefix and XXXXX is a sequential number)
    const typePrefix = this.type.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.customerNumber = `${typePrefix}-${randomNum}`;
  }
  next();
});

const Customer = mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;
