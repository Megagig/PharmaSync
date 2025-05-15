import express from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all appointment routes
router.use(authenticate);

// Get all appointments
router.get('/', appointmentController.getAllAppointments);

// Get appointments by date range
router.get('/range', appointmentController.getAppointmentsByDateRange);

// Get appointments by patient ID
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatientId);

// Get appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// Create new appointment
router.post('/', appointmentController.createAppointment);

// Update appointment
router.put('/:id', appointmentController.updateAppointment);

// Delete appointment
router.delete('/:id', appointmentController.deleteAppointment);

export default router;
