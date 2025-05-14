import mongoose, { Schema } from 'mongoose';
import { IConversation } from '../interfaces/message.interface';

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    title: {
      type: String,
      trim: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ createdBy: 1 });
conversationSchema.index({ updatedAt: -1 });

// Create a compound index for finding conversations between two users
conversationSchema.index({ participants: 1, isGroup: 1 });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;
