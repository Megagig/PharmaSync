import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import medicationRoutes from './medication.routes';
import prescriptionRoutes from './prescription.routes';
import dispensingRoutes from './dispensing.routes';
import supplierRoutes from './supplier.routes';
import purchaseOrderRoutes from './purchaseOrder.routes';
import inventoryRoutes from './inventory.routes';
// Import other routes as they are created

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
router.use('/patients', patientRoutes);
router.use('/medications', medicationRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/dispensing', dispensingRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/inventory', inventoryRoutes);

export default router;
