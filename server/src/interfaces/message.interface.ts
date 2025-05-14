import { Document } from 'mongoose';

export interface IConversation extends Document {
  participants: string[]; // Array of user IDs
  title?: string;
  isGroup: boolean;
  lastMessage?: string; // Reference to message ID
  createdBy: string; // Reference to user ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversationCreate {
  participants: string[];
  title?: string;
  isGroup?: boolean;
  createdBy: string;
}

export interface IConversationUpdate {
  title?: string;
  participants?: string[];
}

export interface IConversationResponse {
  id: string;
  participants: string[];
  title?: string;
  isGroup: boolean;
  lastMessage?: IMessageResponse;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export interface IMessage extends Document {
  conversation: string; // Reference to conversation ID
  sender: string; // Reference to user ID
  content: string;
  attachments?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  }[];
  status: MessageStatus;
  readBy: string[]; // Array of user IDs who have read the message
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageCreate {
  conversation: string;
  sender: string;
  content: string;
  attachments?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  }[];
}

export interface IMessageUpdate {
  status?: MessageStatus;
  readBy?: string[];
}

export interface IMessageResponse {
  id: string;
  conversation: string;
  sender: string;
  content: string;
  attachments?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  }[];
  status: MessageStatus;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageRecipientStatus extends Document {
  message: string; // Reference to message ID
  recipient: string; // Reference to user ID
  status: MessageStatus;
  readAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageRecipientStatusCreate {
  message: string;
  recipient: string;
  status: MessageStatus;
  readAt?: Date;
  deliveredAt?: Date;
}

export interface IMessageRecipientStatusUpdate {
  status?: MessageStatus;
  readAt?: Date;
  deliveredAt?: Date;
}

export interface IMessageRecipientStatusResponse {
  id: string;
  message: string;
  recipient: string;
  status: MessageStatus;
  readAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
