import { Router } from 'express';
import {
  getAllSettings,
  getSettingByKey,
  updateSetting,
  deleteSetting,
  getExpiryNotificationSettings,
  updateExpiryNotificationSettings,
} from '../controllers/settings.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Protect all routes
router.use(protect);
router.use(restrictTo([RoleType.ADMIN]));

// Expiry notification settings routes
router.get('/expiry-notifications', getExpiryNotificationSettings);

// General settings routes
router.get('/', getAllSettings);
router.get('/:key', getSettingByKey);
router.put('/:key', updateSetting);
router.delete('/:key', restrictTo([RoleType.ADMIN]), deleteSetting);

// Validate expiry notification settings
const expiryNotificationSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
    emailRecipients: z.array(z.string().email('Invalid email address')).optional(),
    notificationDays: z.array(z.number().int().positive()).optional(),
    sendTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional(),
    includeInventoryReport: z.boolean().optional(),
  }),
});

router.put('/expiry-notifications', validate(expiryNotificationSchema), updateExpiryNotificationSettings);

export default router;
