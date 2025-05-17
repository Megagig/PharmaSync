import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import medicationRoutes from './medication.routes';
import prescriptionRoutes from './prescription.routes';
import dispensingRoutes from './dispensing.routes';
import supplierRoutes from './supplier.routes';
import purchaseOrderRoutes from './purchaseOrder.routes';
import inventoryRoutes from './inventory.routes';
import reportsRoutes from './reports.routes';
import reportRoutes from './report.routes';
import reportingRoutes from './reporting.routes';
import comprehensiveReportsRoutes from './comprehensive-reports.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import userRoleRoutes from './userRole.routes';
import activityLogRoutes from './activityLog.routes';
import scheduleRoutes from './schedule.routes';
import notificationRoutes from './notification.routes';
import messageRoutes from './message.routes';
import dashboardRoutes from './dashboard.routes';
import followUpRoutes from './followUp.routes';
import appointmentRoutes from './appointment.routes';
import integrationRoutes from './integration.routes';
import productRoutes from './product.routes';
import customerRoutes from './customer.routes';
import locationRoutes from './location.routes';
import inventoryMovementRoutes from './inventoryMovement.routes';
import priceLevelRoutes from './priceLevel.routes';
import transferRoutes from './transfer.routes';
import saleRoutes from './sale.routes';
import invoiceRoutes from './invoice.routes';
import paymentRoutes from './payment.routes';
import returnRoutes from './return.routes';
import reminderRoutes from './reminder.routes';
import posRoutes from './pos.routes';
import expenseRoutes from './expense.routes';
import budgetRoutes from './budget.routes';
import accountingRoutes from './accounting.routes';
import cacheRoutes from './cache.routes';
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
router.use('/inventory/movements', inventoryMovementRoutes);
router.use('/inventory/transfers', transferRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/locations', locationRoutes);
router.use('/price-levels', priceLevelRoutes);
router.use('/sales', saleRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/returns', returnRoutes);
router.use('/reminders', reminderRoutes);
router.use('/reports', reportsRoutes);
router.use('/comprehensive-reports', comprehensiveReportsRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/user-roles', userRoleRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages', messageRoutes);
router.use('/report', reportRoutes);
router.use('/reporting', reportingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/follow-ups', followUpRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/integrations', integrationRoutes);
router.use('/pos', posRoutes);
router.use('/expenses', expenseRoutes);
router.use('/budgets', budgetRoutes);
router.use('/accounting', accountingRoutes);
router.use('/cache', cacheRoutes);

export default router;
