import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { ApprovalStatus } from '../interfaces/user.interface';
import { BadRequestError, NotFoundError } from '../utils/error';
import * as emailService from '../services/email.service';

/**
 * @desc    Get all pending user registrations
 * @route   GET /api/admin/pending-users
 * @access  Private/Admin
 */
export const getPendingUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const pendingUsers = await User.find({
      approvalStatus: ApprovalStatus.PENDING,
    })
      .select(
        '-password -refreshToken -emailVerificationToken -passwordResetToken'
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({
      approvalStatus: ApprovalStatus.PENDING,
    });

    res.status(200).json({
      status: 'success',
      data: {
        users: pendingUsers,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a user registration
 * @route   PATCH /api/admin/approve-user/:id
 * @access  Private/Admin
 */
export const approveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.approvalStatus !== ApprovalStatus.PENDING) {
      throw new BadRequestError('User is not in pending status');
    }

    // Update user status
    user.approvalStatus = ApprovalStatus.APPROVED;
    user.approvedBy = req.user?.id;
    user.approvedAt = new Date();
    user.isActive = true; // Ensure the user is active

    // Save the user and handle any errors
    try {
      await user.save();
      console.log(`User ${user.email} approved successfully`);
    } catch (error) {
      console.error('Error saving approved user:', error);
      throw error;
    }

    // Send approval email
    try {
      await emailService.sendAccountApprovalEmail(
        user.email,
        `${user.firstName} ${user.lastName}`
      );
    } catch (error) {
      console.error('Failed to send approval email:', error);
      // Continue even if email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'User approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a user registration
 * @route   PATCH /api/admin/reject-user/:id
 * @access  Private/Admin
 */
export const rejectUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.approvalStatus !== ApprovalStatus.PENDING) {
      throw new BadRequestError('User is not in pending status');
    }

    // Update user status
    user.approvalStatus = ApprovalStatus.REJECTED;
    user.rejectionReason = reason;
    await user.save();

    // Send rejection email
    try {
      await emailService.sendAccountRejectionEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        reason
      );
    } catch (error) {
      console.error('Failed to send rejection email:', error);
      // Continue even if email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'User registration rejected',
    });
  } catch (error) {
    next(error);
  }
};
