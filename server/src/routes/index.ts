import { Router } from 'express';
import authRoutes from './auth.routes';
// Import other routes as they are created
// import patientRoutes from './patient.routes';
// import medicationRoutes from './medication.routes';
// import prescriptionRoutes from './prescription.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
  });
});

// Mount routes
router.use('/auth', authRoutes);
// router.use('/patients', patientRoutes);
// router.use('/medications', medicationRoutes);
// router.use('/prescriptions', prescriptionRoutes);

export default router;
