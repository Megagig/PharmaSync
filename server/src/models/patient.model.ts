import mongoose, { Schema } from 'mongoose';
import { IPatient, Gender, BloodGroup } from '../interfaces/patient.interface';

const allergySchema = new Schema(
  {
    allergen: {
      type: String,
      required: true,
    },
    reaction: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true,
    },
    dateIdentified: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const medicalConditionSchema = new Schema(
  {
    condition: {
      type: String,
      required: true,
    },
    diagnosisDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'in_remission'],
      required: true,
    },
    notes: {
      type: String,
    },
  },
  { _id: true }
);

const patientSchema = new Schema<IPatient>(
  {
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
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: Object.values(BloodGroup),
    },
    allergies: [allergySchema],
    medicalConditions: [medicalConditionSchema],
    medications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Medication',
      },
    ],
    notes: {
      type: String,
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
patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ phoneNumber: 1 });
patientSchema.index({ email: 1 });

const Patient = mongoose.model<IPatient>('Patient', patientSchema);

export default Patient;
