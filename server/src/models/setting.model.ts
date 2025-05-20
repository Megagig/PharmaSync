import mongoose, { Schema } from 'mongoose';

export interface ISetting extends mongoose.Document {
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
settingSchema.index({ key: 1 });

const Setting = mongoose.model<ISetting>('Setting', settingSchema);

export default Setting;
