import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';
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
router.post(
  '/configurations',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  createReportConfiguration
);
router.get('/configurations/:id', getReportConfigurationById);
router.patch(
  '/configurations/:id',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  updateReportConfiguration
);
router.delete(
  '/configurations/:id',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  deleteReportConfiguration
);
router.post('/configurations/:id/generate', generateReportFromConfiguration);

// Report generation
router.post(
  '/generate',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  generateReport
);

// Report executions
router.get('/executions', getReportExecutions);
router.get('/download/:id', downloadReport);

// Report schedules
router.get('/schedules', getReportSchedules);
router.post(
  '/schedules',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  createReportSchedule
);
router.patch(
  '/schedules/:id',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  updateReportSchedule
);
router.delete(
  '/schedules/:id',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  deleteReportSchedule
);

export default router;
