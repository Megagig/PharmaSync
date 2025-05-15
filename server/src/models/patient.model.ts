import mongoose, { Schema } from 'mongoose';
import {
  IPatient,
  Gender,
  BloodGroup,
  Genotype,
  MaritalStatus,
  DrugTherapyProblemType,
} from '../interfaces/patient.interface';

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

const medicationHistorySchema = new Schema(
  {
    medication: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const clinicalAssessmentSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    bloodPressure: {
      type: String,
      required: true,
    },
    respiratoryRate: {
      type: String,
      required: true,
    },
    temperature: {
      type: String,
      required: true,
    },
    heartSounds: {
      type: String,
      required: true,
    },
    palor: {
      type: Boolean,
      default: false,
    },
    dehydration: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
  },
  { _id: true }
);

const laboratoryFindingSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    pcv: {
      type: String,
    },
    mcms: {
      type: String,
    },
    euCr: {
      type: String,
    },
    fbc: {
      type: String,
    },
    fbs: {
      type: String,
    },
    hbA1c: {
      type: String,
    },
    other: {
      type: Map,
      of: String,
    },
    notes: {
      type: String,
    },
  },
  { _id: true }
);

const drugTherapyProblemSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      enum: Object.values(DrugTherapyProblemType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    resolution: {
      type: String,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const carePlanSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    goals: {
      type: [String],
      required: true,
    },
    objectives: {
      type: [String],
      required: true,
    },
    followUpDate: {
      type: Date,
      required: true,
    },
    drugTherapyProblemResolved: {
      type: Boolean,
      default: false,
    },
    needsReview: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
  },
  { _id: true }
);

const soapNoteSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    subjective: {
      type: String,
      required: true,
    },
    objective: {
      type: String,
      required: true,
    },
    assessment: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      required: true,
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
    genotype: {
      type: String,
      enum: Object.values(Genotype),
    },
    maritalStatus: {
      type: String,
      enum: Object.values(MaritalStatus),
    },
    weight: {
      type: Number,
    },
    allergies: [allergySchema],
    medicalConditions: [medicalConditionSchema],
    medicationHistory: [medicationHistorySchema],
    clinicalAssessments: [clinicalAssessmentSchema],
    laboratoryFindings: [laboratoryFindingSchema],
    drugTherapyProblems: [drugTherapyProblemSchema],
    carePlans: [carePlanSchema],
    soapNotes: [soapNoteSchema],
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

// Virtual for age calculation
patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;

  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Create indexes for faster queries
patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ phoneNumber: 1 });
patientSchema.index({ email: 1 });

const Patient = mongoose.model<IPatient>('Patient', patientSchema);

export default Patient;
