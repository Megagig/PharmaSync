import mongoose, { Schema } from 'mongoose';
import { IAppointment } from '../interfaces/appointment.interface';

const appointmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'follow_up',
        'initial_consultation',
        'medication_review',
        'counseling',
        'other',
      ],
      default: 'follow_up',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ startTime: 1 });
appointmentSchema.index({ endTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ type: 1 });

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
