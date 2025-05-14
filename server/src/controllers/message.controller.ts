import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import MessageRecipientStatus from '../models/messageRecipientStatus.model';
import { MessageStatus } from '../interfaces/message.interface';
import { AppError } from '../utils/error';
import { createNotification } from './notification.controller';
import {
  NotificationType,
  NotificationPriority,
} from '../interfaces/notification.interface';

/**
 * @desc    Get all conversations for the current user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getMyConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Find conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate({
        path: 'participants',
        select: 'firstName lastName email profileImage',
      })
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt',
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName',
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Conversation.countDocuments({
      participants: req.user.id,
    });

    // Get unread count for each conversation
    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await MessageRecipientStatus.countDocuments({
          recipient: req.user.id,
          status: { $ne: MessageStatus.READ },
          message: {
            $in: await Message.find({ conversation: conversation._id }).select(
              '_id'
            ),
          },
        });

        return {
          ...conversation.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: conversationsWithUnreadCount,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Create a new conversation
 * @route   POST /api/messages/conversations
 * @access  Private
 */
export const createConversation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { participants, title, isGroup } = req.body;

    // Ensure the current user is included in participants
    if (!participants.includes(req.user.id)) {
      participants.push(req.user.id);
    }

    // Check if a non-group conversation already exists between these participants
    if (!isGroup && participants.length === 2) {
      const existingConversation = await Conversation.findOne({
        participants: { $all: participants, $size: participants.length },
        isGroup: false,
      });

      if (existingConversation) {
        res.status(200).json({
          status: 'success',
          data: existingConversation,
          message: 'Conversation already exists',
        });
        return;
      }
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants,
      title: isGroup ? title : undefined,
      isGroup: isGroup || false,
      createdBy: req.user.id,
    });

    // Populate the conversation with participant details
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate({
        path: 'participants',
        select: 'firstName lastName email profileImage',
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName',
      });

    res.status(201).json({
      status: 'success',
      data: populatedConversation,
    });
  }
);

/**
 * @desc    Get conversation by ID
 * @route   GET /api/messages/conversations/:id
 * @access  Private
 */
export const getConversationById = asyncHandler(
  async (req: Request, res: Response) => {
    const conversation = await Conversation.findById(req.params.id)
      .populate({
        path: 'participants',
        select: 'firstName lastName email profileImage',
      })
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt',
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName',
      });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    // Check if the current user is a participant
    const participantIds = conversation.participants.map((p: any) =>
      typeof p === 'string' ? p : p._id.toString()
    );
    if (!participantIds.includes(req.user.id)) {
      throw new AppError('Not authorized to access this conversation', 403);
    }

    res.status(200).json({
      status: 'success',
      data: conversation,
    });
  }
);

/**
 * @desc    Update conversation
 * @route   PATCH /api/messages/conversations/:id
 * @access  Private
 */
export const updateConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, participants } = req.body;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    // Check if the current user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      throw new AppError('Not authorized to update this conversation', 403);
    }

    // Only allow updates to group conversations
    if (!conversation.isGroup) {
      throw new AppError('Cannot update a direct conversation', 400);
    }

    // Update conversation
    if (title) {
      conversation.title = title;
    }

    if (participants) {
      // Ensure the current user remains in the conversation
      if (!participants.includes(req.user.id)) {
        participants.push(req.user.id);
      }

      conversation.participants = participants;
    }

    await conversation.save();

    // Populate the updated conversation
    const updatedConversation = await Conversation.findById(conversation._id)
      .populate({
        path: 'participants',
        select: 'firstName lastName email profileImage',
      })
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt',
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName',
      });

    res.status(200).json({
      status: 'success',
      data: updatedConversation,
    });
  }
);

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/messages/conversations/:id/messages
 * @access  Private
 */
export const getConversationMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const conversationId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    // Check if the current user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      throw new AppError('Not authorized to access this conversation', 403);
    }

    // Get messages for the conversation
    const messages = await Message.find({ conversation: conversationId })
      .populate({
        path: 'sender',
        select: 'firstName lastName email profileImage',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Message.countDocuments({
      conversation: conversationId,
    });

    // Mark messages as read
    await MessageRecipientStatus.updateMany(
      {
        recipient: req.user.id,
        message: { $in: messages.map((m) => m._id) },
        status: { $ne: MessageStatus.READ },
      },
      {
        status: MessageStatus.READ,
        readAt: new Date(),
      }
    );

    // Update the message read status
    await Message.updateMany(
      {
        _id: { $in: messages.map((m) => m._id) },
        sender: { $ne: req.user.id },
      },
      {
        $addToSet: { readBy: req.user.id },
      }
    );

    res.status(200).json({
      status: 'success',
      data: messages,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Send a message
 * @route   POST /api/messages/conversations/:id/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content, attachments } = req.body;
  const conversationId = req.params.id;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  // Check if the current user is a participant
  if (!conversation.participants.includes(req.user.id)) {
    throw new AppError(
      'Not authorized to send messages to this conversation',
      403
    );
  }

  // Create the message
  const message = await Message.create({
    conversation: conversationId,
    sender: req.user.id,
    content,
    attachments,
    status: MessageStatus.SENT,
    readBy: [req.user.id], // Sender has read the message
  });

  // Create message status for each recipient
  const recipients = conversation.participants.filter(
    (p) => p.toString() !== req.user.id
  );

  await Promise.all(
    recipients.map((recipient) =>
      MessageRecipientStatus.create({
        message: message._id,
        recipient,
        status: MessageStatus.SENT,
      })
    )
  );

  // Send notification to all recipients
  await Promise.all(
    recipients.map((recipient) =>
      createNotification({
        user: recipient.toString(),
        type: NotificationType.NEW_MESSAGE,
        title: 'New Message',
        message: `You have a new message from ${req.user.firstName} ${req.user.lastName}`,
        priority: NotificationPriority.MEDIUM,
        data: {
          conversationId,
          messageId: message._id,
        },
        link: `/messages/conversations/${conversationId}`,
      })
    )
  );

  // Populate the message with sender details
  const populatedMessage = await Message.findById(message._id).populate({
    path: 'sender',
    select: 'firstName lastName email profileImage',
  });

  res.status(201).json({
    status: 'success',
    data: populatedMessage,
  });
});

/**
 * @desc    Mark message as delivered
 * @route   PATCH /api/messages/:id/delivered
 * @access  Private
 */
export const markMessageAsDelivered = asyncHandler(
  async (req: Request, res: Response) => {
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Check if the current user is a recipient
    const recipientStatus = await MessageRecipientStatus.findOne({
      message: messageId,
      recipient: req.user.id,
    });

    if (!recipientStatus) {
      throw new AppError('Not authorized to update this message status', 403);
    }

    // Update status to delivered if not already read
    if (recipientStatus.status !== MessageStatus.READ) {
      recipientStatus.status = MessageStatus.DELIVERED;
      recipientStatus.deliveredAt = new Date();
      await recipientStatus.save();
    }

    res.status(200).json({
      status: 'success',
      data: recipientStatus,
    });
  }
);

/**
 * @desc    Mark message as read
 * @route   PATCH /api/messages/:id/read
 * @access  Private
 */
export const markMessageAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Check if the current user is a recipient
    const recipientStatus = await MessageRecipientStatus.findOne({
      message: messageId,
      recipient: req.user.id,
    });

    if (!recipientStatus) {
      throw new AppError('Not authorized to update this message status', 403);
    }

    // Update status to read
    recipientStatus.status = MessageStatus.READ;
    recipientStatus.readAt = new Date();
    await recipientStatus.save();

    // Add user to message readBy array
    if (!message.readBy.includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
    }

    res.status(200).json({
      status: 'success',
      data: recipientStatus,
    });
  }
);
