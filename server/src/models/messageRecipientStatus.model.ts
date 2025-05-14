import mongoose, { Schema } from 'mongoose';
import { IMessageRecipientStatus, MessageStatus } from '../interfaces/message.interface';

const messageRecipientStatusSchema = new Schema<IMessageRecipientStatus>(
  {
    message: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.SENT,
    },
    readAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
messageRecipientStatusSchema.index({ message: 1, recipient: 1 }, { unique: true });
messageRecipientStatusSchema.index({ recipient: 1 });
messageRecipientStatusSchema.index({ status: 1 });

const MessageRecipientStatus = mongoose.model<IMessageRecipientStatus>(
  'MessageRecipientStatus',
  messageRecipientStatusSchema
);

export default MessageRecipientStatus;
