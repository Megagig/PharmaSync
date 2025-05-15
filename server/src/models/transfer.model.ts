import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransferItem {
  product?: Types.ObjectId;
  medication?: Types.ObjectId;
  batchNumber: string;
  quantity: number;
  _id?: Types.ObjectId;
}

export interface ITransfer extends Document {
  referenceNumber: string;
  sourceLocation: Types.ObjectId;
  destinationLocation: Types.ObjectId;
  items: ITransferItem[];
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  completedBy?: Types.ObjectId;
  completedAt?: Date;
  cancelledBy?: Types.ObjectId;
  cancelledAt?: Date;
  _id: Types.ObjectId;
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
    min: 1,
  },
});

const transferSchema = new Schema(
  {
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
    notes: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

const Transfer = mongoose.model<ITransfer>('Transfer', transferSchema);

export default Transfer;
