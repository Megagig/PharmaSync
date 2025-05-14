import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getMyConversations,
  createConversation,
  getConversationById,
  updateConversation,
  getConversationMessages,
  sendMessage,
  markMessageAsDelivered,
  markMessageAsRead,
} from '../controllers/message.controller';

const router = express.Router();

// Protect all routes
router.use(protect);

// Conversation routes
router.get('/conversations', getMyConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id', getConversationById);
router.patch('/conversations/:id', updateConversation);

// Message routes
router.get('/conversations/:id/messages', getConversationMessages);
router.post('/conversations/:id/messages', sendMessage);
router.patch('/:id/delivered', markMessageAsDelivered);
router.patch('/:id/read', markMessageAsRead);

export default router;
