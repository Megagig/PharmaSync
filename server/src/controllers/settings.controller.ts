import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Setting from '../models/setting.model';
import { AppError } from '../utils/error';

/**
 * @desc    Get all settings
 * @route   GET /api/settings
 * @access  Private/Admin
 */
export const getAllSettings = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const settings = await Setting.find();

    res.status(200).json({
      success: true,
      data: settings,
    });
  }
);

/**
 * @desc    Get setting by key
 * @route   GET /api/settings/:key
 * @access  Private/Admin
 */
export const getSettingByKey = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { key } = req.params;

    const setting = await Setting.findOne({ key });

    if (!setting) {
      throw new AppError(`Setting with key ${key} not found`, 404);
    }

    res.status(200).json({
      success: true,
      data: setting,
    });
  }
);

/**
 * @desc    Create or update setting
 * @route   PUT /api/settings/:key
 * @access  Private/Admin
 */
export const updateSetting = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      throw new AppError('Value is required', 400);
    }

    // Find and update or create if not exists
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: setting,
    });
  }
);

/**
 * @desc    Delete setting
 * @route   DELETE /api/settings/:key
 * @access  Private/Admin
 */
export const deleteSetting = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { key } = req.params;

    const setting = await Setting.findOneAndDelete({ key });

    if (!setting) {
      throw new AppError(`Setting with key ${key} not found`, 404);
    }

    res.status(200).json({
      success: true,
      message: `Setting with key ${key} deleted successfully`,
    });
  }
);

/**
 * @desc    Get expiry notification settings
 * @route   GET /api/settings/expiry-notifications
 * @access  Private/Admin
 */
export const getExpiryNotificationSettings = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const setting = await Setting.findOne({ key: 'expiryNotifications' });

    // If setting doesn't exist, return default values
    if (!setting) {
      res.status(200).json({
        success: true,
        data: {
          enabled: false,
          emailRecipients: [],
          notificationDays: [30, 60, 90],
          sendTime: '08:00',
          includeInventoryReport: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: setting.value,
    });
  }
);

/**
 * @desc    Update expiry notification settings
 * @route   PUT /api/settings/expiry-notifications
 * @access  Private/Admin
 */
export const updateExpiryNotificationSettings = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      enabled,
      emailRecipients,
      notificationDays,
      sendTime,
      includeInventoryReport,
    } = req.body;

    // Validate required fields
    if (enabled === undefined) {
      throw new AppError('Enabled status is required', 400);
    }

    if (enabled && (!emailRecipients || emailRecipients.length === 0)) {
      throw new AppError(
        'Email recipients are required when notifications are enabled',
        400
      );
    }

    if (enabled && (!notificationDays || notificationDays.length === 0)) {
      throw new AppError(
        'Notification days are required when notifications are enabled',
        400
      );
    }

    // Create or update setting
    const setting = await Setting.findOneAndUpdate(
      { key: 'expiryNotifications' },
      {
        value: {
          enabled,
          emailRecipients: emailRecipients || [],
          notificationDays: notificationDays || [30, 60, 90],
          sendTime: sendTime || '08:00',
          includeInventoryReport:
            includeInventoryReport !== undefined
              ? includeInventoryReport
              : true,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: setting.value,
      message: 'Expiry notification settings updated successfully',
    });
  }
);
