import mongoose, { Schema } from 'mongoose';
import { IInsuranceClaim, ClaimStatus, ClaimType, RejectionReason } from '../interfaces/insurance.interface';

const InsuranceClaimSchema: Schema = new Schema(
  {
    claimNumber: {
      type: String,
      required: [true, 'Claim number is required'],
      trim: true,
      unique: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    customerInsurance: {
      type: Schema.Types.ObjectId,
      ref: 'CustomerInsurance',
      required: [true, 'Customer insurance is required'],
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
    transaction: {
      type: Schema.Types.ObjectId,
      ref: 'PosTransaction',
      required: [true, 'Transaction is required'],
    },
    prescription: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    claimDate: {
      type: Date,
      required: [true, 'Claim date is required'],
      default: Date.now,
    },
    claimType: {
      type: String,
      enum: Object.values(ClaimType),
      required: [true, 'Claim type is required'],
    },
    claimStatus: {
      type: String,
      enum: Object.values(ClaimStatus),
      default: ClaimStatus.PENDING,
    },
    claimAmount: {
      type: Number,
      required: [true, 'Claim amount is required'],
      min: 0,
    },
    approvedAmount: {
      type: Number,
      min: 0,
    },
    rejectionReason: {
      type: String,
      enum: Object.values(RejectionReason),
    },
    rejectionDetails: {
      type: String,
      trim: true,
    },
    submissionDate: {
      type: Date,
    },
    responseDate: {
      type: Date,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        totalPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        coveragePercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        coveredAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        patientAmount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalClaimAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalApprovedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPatientAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [String],
    },
    responseDetails: {
      type: Schema.Types.Mixed,
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

// Indexes for faster lookups
InsuranceClaimSchema.index({ claimNumber: 1 });
InsuranceClaimSchema.index({ customer: 1 });
InsuranceClaimSchema.index({ provider: 1 });
InsuranceClaimSchema.index({ transaction: 1 });
InsuranceClaimSchema.index({ claimStatus: 1 });
InsuranceClaimSchema.index({ claimDate: 1 });

// Pre-save hook to calculate totals
InsuranceClaimSchema.pre('save', function (next) {
  if (this.isModified('items')) {
    let totalClaimAmount = 0;
    let totalApprovedAmount = 0;
    let totalPatientAmount = 0;

    (this.items as any[]).forEach(item => {
      totalClaimAmount += item.coveredAmount;
      totalPatientAmount += item.patientAmount;
    });

    this.totalClaimAmount = totalClaimAmount;
    this.totalPatientAmount = totalPatientAmount;

    if (this.claimStatus === ClaimStatus.APPROVED || this.claimStatus === ClaimStatus.PARTIALLY_APPROVED) {
      totalApprovedAmount = (this as any).approvedAmount || 0;
      this.totalApprovedAmount = totalApprovedAmount;
    }
  }

  next();
});

// Generate claim number
InsuranceClaimSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await (this.constructor as any).countDocuments();
    this.claimNumber = `CLM-${(count + 1).toString().padStart(6, '0')}`;
  }

  next();
});

const InsuranceClaim = mongoose.model<IInsuranceClaim>(
  'InsuranceClaim',
  InsuranceClaimSchema
);

export default InsuranceClaim;
