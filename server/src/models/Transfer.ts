import mongoose, { Document, Schema } from 'mongoose';

export interface TransferItem {
  product?: mongoose.Types.ObjectId;
  medication?: mongoose.Types.ObjectId;
  batchNumber: string;
  quantity: number;
}

export interface ITransfer extends Document {
  referenceNumber: string;
  sourceLocation: mongoose.Types.ObjectId;
  destinationLocation: mongoose.Types.ObjectId;
  items: TransferItem[];
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
  completedAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
}

const transferItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  medication: {
    type: Schema.Types.ObjectId,
    ref: 'Medication',
  },
  batchNumber: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: true });

const transferSchema = new Schema<ITransfer>({
  referenceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  sourceLocation: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  destinationLocation: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  items: [transferItemSchema],
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  completedAt: {
    type: Date,
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  cancelledAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Validate that each item has either product or medication, but not both
transferSchema.path('items').validate(function(items: TransferItem[]) {
  if (!items || items.length === 0) {
    return false;
  }
  
  return items.every(item => {
    const hasProduct = !!item.product;
    const hasMedication = !!item.medication;
    return (hasProduct || hasMedication) && !(hasProduct && hasMedication);
  });
}, 'Each item must have either product or medication, but not both');

// Validate that source and destination locations are different
transferSchema.pre('validate', function(next) {
  if (this.sourceLocation && this.destinationLocation && 
      this.sourceLocation.toString() === this.destinationLocation.toString()) {
    this.invalidate('destinationLocation', 'Source and destination locations cannot be the same');
  }
  next();
});

const Transfer = mongoose.model<ITransfer>('Transfer', transferSchema);

export default Transfer;
