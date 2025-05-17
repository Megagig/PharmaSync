import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointment.service';
import { AppError } from '../utils/error';

/**
 * @desc    Get all appointments
 * @route   GET /api/appointments
 * @access  Private
 */
export const getAllAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointments = await appointmentService.getAllAppointments();

    res.status(200).json({
      status: 'success',
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id
    );

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new appointment
 * @route   POST /api/appointments
 * @access  Private
 */
export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Add the user ID to the appointment data
    const appointmentData = {
      ...req.body,
      createdBy: req.user?.id,
    };

    const appointment = await appointmentService.createAppointment(
      appointmentData
    );

    res.status(201).json({
      status: 'success',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
export const updateAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointment = await appointmentService.updateAppointment(
      req.params.id,
      req.body
    );

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
export const deleteAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointment = await appointmentService.deleteAppointment(
      req.params.id
    );

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments by patient ID
 * @route   GET /api/appointments/patient/:patientId
 * @access  Private
 */
export const getAppointmentsByPatientId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointments = await appointmentService.getAppointmentsByPatientId(
      req.params.patientId
    );

    res.status(200).json({
      status: 'success',
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments by date range
 * @route   GET /api/appointments/range
 * @access  Private
 */
export const getAppointmentsByDateRange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }

    const appointments = await appointmentService.getAppointmentsByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.status(200).json({
      status: 'success',
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};
