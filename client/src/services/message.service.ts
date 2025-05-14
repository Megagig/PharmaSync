import api from './api';
import { 
  Conversation, 
  ConversationCreateData, 
  ConversationFilters, 
  ConversationUpdateData, 
  Message, 
  MessageCreateData, 
  MessageFilters 
} from '@/types/message.types';

const BASE_URL = '/messages';

/**
 * Get all conversations for the current user
 * @param filters Conversation filters
 * @returns Promise with conversations data
 */
export const getConversations = async (filters: ConversationFilters = {}) => {
  const { page = 1, limit = 20 } = filters;
  
  const response = await api.get(`${BASE_URL}/conversations?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Create a new conversation
 * @param data Conversation create data
 * @returns Promise with created conversation data
 */
export const createConversation = async (data: ConversationCreateData) => {
  const response = await api.post(`${BASE_URL}/conversations`, data);
  return response.data;
};

/**
 * Get a conversation by ID
 * @param id Conversation ID
 * @returns Promise with conversation data
 */
export const getConversationById = async (id: string) => {
  const response = await api.get(`${BASE_URL}/conversations/${id}`);
  return response.data;
};

/**
 * Update a conversation
 * @param id Conversation ID
 * @param data Conversation update data
 * @returns Promise with updated conversation data
 */
export const updateConversation = async (id: string, data: ConversationUpdateData) => {
  const response = await api.patch(`${BASE_URL}/conversations/${id}`, data);
  return response.data;
};

/**
 * Get messages for a conversation
 * @param conversationId Conversation ID
 * @param filters Message filters
 * @returns Promise with messages data
 */
export const getConversationMessages = async (conversationId: string, filters: MessageFilters = {}) => {
  const { page = 1, limit = 20 } = filters;
  
  const response = await api.get(`${BASE_URL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Send a message to a conversation
 * @param conversationId Conversation ID
 * @param data Message create data
 * @returns Promise with created message data
 */
export const sendMessage = async (conversationId: string, data: MessageCreateData) => {
  const response = await api.post(`${BASE_URL}/conversations/${conversationId}/messages`, data);
  return response.data;
};

/**
 * Mark a message as delivered
 * @param id Message ID
 * @returns Promise with updated message status
 */
export const markMessageAsDelivered = async (id: string) => {
  const response = await api.patch(`${BASE_URL}/${id}/delivered`);
  return response.data;
};

/**
 * Mark a message as read
 * @param id Message ID
 * @returns Promise with updated message status
 */
export const markMessageAsRead = async (id: string) => {
  const response = await api.patch(`${BASE_URL}/${id}/read`);
  return response.data;
};
