import { User } from './user.types';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

// String literal type for message status
export type MessageStatusString = 'sent' | 'delivered' | 'read';

export interface Attachment {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: string | User;
  content: string;
  attachments?: Attachment[];
  status: MessageStatus | MessageStatusString;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecipientStatus {
  id: string;
  message: string;
  recipient: string;
  status: MessageStatus;
  readAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: string[] | User[];
  title?: string;
  isGroup: boolean;
  lastMessage?: Message;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export interface ConversationCreateData {
  participants: string[];
  title?: string;
  isGroup?: boolean;
}

export interface ConversationUpdateData {
  title?: string;
  participants?: string[];
}

export interface MessageCreateData {
  content: string;
  attachments?: Attachment[];
}

export interface MessageFilters {
  page?: number;
  limit?: number;
}

export interface ConversationFilters {
  page?: number;
  limit?: number;
}

export interface MessageState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  totalMessages: number;
  totalConversations: number;
  totalPages: number;
  currentPage: number;
}
