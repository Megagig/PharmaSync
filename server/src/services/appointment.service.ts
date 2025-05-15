import Appointment from '../models/appointment.model';
import { IAppointment } from '../interfaces/appointment.interface';
import { AppError } from '../utils/error';

/**
 * Get all appointments
 * @returns List of appointments
 */
export const getAllAppointments = async (): Promise<IAppointment[]> => {
  const appointments = await Appointment.find().sort({ startTime: 1 });
  return appointments;
};

/**
 * Get appointment by ID
 * @param id Appointment ID
 * @returns Appointment or null if not found
 */
export const getAppointmentById = async (
  id: string
): Promise<IAppointment | null> => {
  const appointment = await Appointment.findById(id);
  return appointment;
};

/**
 * Create a new appointment
 * @param appointmentData Appointment data
 * @returns Created appointment
 */
export const createAppointment = async (
  appointmentData: any
): Promise<IAppointment> => {
  // Check for overlapping appointments
  const overlappingAppointments = await Appointment.find({
    $or: [
      {
        startTime: { $lt: appointmentData.endTime },
        endTime: { $gt: appointmentData.startTime },
      },
    ],
  });

  if (overlappingAppointments.length > 0) {
    throw new AppError(
      'There is already an appointment scheduled for this time',
      400
    );
  }

  const appointment = await Appointment.create(appointmentData);
  return appointment;
};

/**
 * Update an appointment
 * @param id Appointment ID
 * @param appointmentData Updated appointment data
 * @returns Updated appointment or null if not found
 */
export const updateAppointment = async (
  id: string,
  appointmentData: any
): Promise<IAppointment | null> => {
  // Check for overlapping appointments (excluding this appointment)
  const overlappingAppointments = await Appointment.find({
    _id: { $ne: id },
    $or: [
      {
        startTime: { $lt: appointmentData.endTime },
        endTime: { $gt: appointmentData.startTime },
      },
    ],
  });

  if (overlappingAppointments.length > 0) {
    throw new AppError(
      'There is already an appointment scheduled for this time',
      400
    );
  }

  const appointment = await Appointment.findByIdAndUpdate(id, appointmentData, {
    new: true,
    runValidators: true,
  });

  return appointment;
};

/**
 * Delete an appointment
 * @param id Appointment ID
 * @returns Deleted appointment or null if not found
 */
export const deleteAppointment = async (
  id: string
): Promise<IAppointment | null> => {
  const appointment = await Appointment.findByIdAndDelete(id);
  return appointment;
};

/**
 * Get appointments by patient ID
 * @param patientId Patient ID
 * @returns List of appointments for the patient
 */
export const getAppointmentsByPatientId = async (
  patientId: string
): Promise<IAppointment[]> => {
  const appointments = await Appointment.find({ patientId }).sort({
    startTime: 1,
  });
  return appointments;
};

/**
 * Get appointments by date range
 * @param startDate Start date
 * @param endDate End date
 * @returns List of appointments within the date range
 */
export const getAppointmentsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<IAppointment[]> => {
  const appointments = await Appointment.find({
    startTime: { $gte: startDate },
    endTime: { $lte: endDate },
  }).sort({ startTime: 1 });

  return appointments;
};
