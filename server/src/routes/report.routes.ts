import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import {
  getReportConfigurations,
  getReportConfigurationById,
  createReportConfiguration,
  updateReportConfiguration,
  deleteReportConfiguration,
  generateReport,
  generateReportFromConfiguration,
  getReportExecutions,
  downloadReport,
  createReportSchedule,
  getReportSchedules,
  updateReportSchedule,
  deleteReportSchedule,
} from '../controllers/report.controller';

const router = express.Router();

// Protect all routes
router.use(protect);

// Report configurations
router.get('/configurations', getReportConfigurations);
router.post('/configurations', restrictTo(['admin', 'pharmacist']), createReportConfiguration);
router.get('/configurations/:id', getReportConfigurationById);
router.patch('/configurations/:id', restrictTo(['admin', 'pharmacist']), updateReportConfiguration);
router.delete('/configurations/:id', restrictTo(['admin', 'pharmacist']), deleteReportConfiguration);
router.post('/configurations/:id/generate', generateReportFromConfiguration);

// Report generation
router.post('/generate', restrictTo(['admin', 'pharmacist']), generateReport);

// Report executions
router.get('/executions', getReportExecutions);
router.get('/download/:id', downloadReport);

// Report schedules
router.get('/schedules', getReportSchedules);
router.post('/schedules', restrictTo(['admin', 'pharmacist']), createReportSchedule);
router.patch('/schedules/:id', restrictTo(['admin', 'pharmacist']), updateReportSchedule);
router.delete('/schedules/:id', restrictTo(['admin', 'pharmacist']), deleteReportSchedule);

export default router;
