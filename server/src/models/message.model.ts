import mongoose, { Schema } from 'mongoose';
import { IMessage, MessageStatus } from '../interfaces/message.interface';
import Conversation from './conversation.model';

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        fileName: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.SENT,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
messageSchema.index({ conversation: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });

// Update the conversation's lastMessage when a new message is created
messageSchema.post('save', async function (doc) {
  await Conversation.findByIdAndUpdate(doc.conversation, {
    lastMessage: doc._id,
    updatedAt: new Date(),
  });
});

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
