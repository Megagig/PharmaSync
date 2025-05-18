import mongoose, { Schema } from 'mongoose';
import { ICustomerInsurance } from '../interfaces/insurance.interface';

const CustomerInsuranceSchema: Schema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'InsuranceProvider',
      required: [true, 'Insurance provider is required'],
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'InsurancePlan',
      required: [true, 'Insurance plan is required'],
    },
    policyNumber: {
      type: String,
      required: [true, 'Policy number is required'],
      trim: true,
    },
    groupNumber: {
      type: String,
      trim: true,
    },
    primaryCardHolder: {
      firstName: {
        type: String,
        required: [true, 'Primary card holder first name is required'],
        trim: true,
      },
      lastName: {
        type: String,
        required: [true, 'Primary card holder last name is required'],
        trim: true,
      },
      dateOfBirth: {
        type: Date,
        required: [true, 'Primary card holder date of birth is required'],
      },
      relationship: {
        type: String,
        required: [true, 'Relationship to primary card holder is required'],
        trim: true,
        enum: ['self', 'spouse', 'child', 'other'],
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Insurance start date is required'],
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    coverageDetails: {
      prescription: {
        coveragePercentage: {
          type: Number,
          min: 0,
          max: 100,
        },
        deductible: {
          type: Number,
          min: 0,
        },
        deductibleMet: {
          type: Boolean,
          default: false,
        },
        annualLimit: {
          type: Number,
          min: 0,
        },
        usedAmount: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
      otc: {
        coveragePercentage: {
          type: Number,
          min: 0,
          max: 100,
        },
        deductible: {
          type: Number,
          min: 0,
        },
        deductibleMet: {
          type: Boolean,
          default: false,
        },
        annualLimit: {
          type: Number,
          min: 0,
        },
        usedAmount: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    },
    cardFrontImage: {
      type: String,
    },
    cardBackImage: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for customer and provider
CustomerInsuranceSchema.index({ customer: 1, provider: 1, policyNumber: 1 }, { unique: true });
CustomerInsuranceSchema.index({ customer: 1, isPrimary: 1 });
CustomerInsuranceSchema.index({ isActive: 1 });

// Pre-save hook to ensure only one primary insurance per customer
CustomerInsuranceSchema.pre('save', async function (next) {
  if (this.isPrimary) {
    // Find other primary insurances for this customer
    const otherPrimary = await this.constructor.findOne({
      customer: this.customer,
      isPrimary: true,
      _id: { $ne: this._id },
    });
    
    if (otherPrimary) {
      // Update the other primary insurance to not be primary
      await this.constructor.updateOne(
        { _id: otherPrimary._id },
        { $set: { isPrimary: false } }
      );
    }
  }
  
  next();
});

const CustomerInsurance = mongoose.model<ICustomerInsurance>(
  'CustomerInsurance',
  CustomerInsuranceSchema
);

export default CustomerInsurance;
