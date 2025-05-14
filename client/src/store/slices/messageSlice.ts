import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getConversations,
  createConversation,
  getConversationById,
  updateConversation,
  getConversationMessages,
  sendMessage,
  markMessageAsDelivered,
  markMessageAsRead,
} from '@/services/message.service';
import {
  Conversation,
  ConversationCreateData,
  ConversationFilters,
  ConversationUpdateData,
  Message,
  MessageCreateData,
  MessageFilters,
  MessageState,
} from '@/types/message.types';

const initialState: MessageState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  totalMessages: 0,
  totalConversations: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (filters: ConversationFilters, { rejectWithValue }) => {
    try {
      const response = await getConversations(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const createNewConversation = createAsyncThunk(
  'messages/createConversation',
  async (data: ConversationCreateData, { rejectWithValue }) => {
    try {
      const response = await createConversation(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation');
    }
  }
);

export const fetchConversationById = createAsyncThunk(
  'messages/fetchConversationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getConversationById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversation');
    }
  }
);

export const updateConversationById = createAsyncThunk(
  'messages/updateConversation',
  async ({ id, data }: { id: string; data: ConversationUpdateData }, { rejectWithValue }) => {
    try {
      const response = await updateConversation(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update conversation');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ conversationId, filters }: { conversationId: string; filters?: MessageFilters }, { rejectWithValue }) => {
    try {
      const response = await getConversationMessages(conversationId, filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendNewMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, data }: { conversationId: string; data: MessageCreateData }, { rejectWithValue }) => {
    try {
      const response = await sendMessage(conversationId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const markAsDelivered = createAsyncThunk(
  'messages/markAsDelivered',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await markMessageAsDelivered(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark message as delivered');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await markMessageAsRead(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark message as read');
    }
  }
);

// Slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    clearMessageError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.data;
        state.totalConversations = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create conversation
      .addCase(createNewConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = [action.payload.data, ...state.conversations];
        state.currentConversation = action.payload.data;
        state.totalConversations += 1;
      })
      .addCase(createNewConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch conversation by ID
      .addCase(fetchConversationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload.data;
        
        // Update conversation in the list if it exists
        const index = state.conversations.findIndex(c => c.id === action.payload.data.id);
        if (index !== -1) {
          state.conversations[index] = action.payload.data;
        }
      })
      .addCase(fetchConversationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update conversation
      .addCase(updateConversationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateConversationById.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update conversation in the list
        const index = state.conversations.findIndex(c => c.id === action.payload.data.id);
        if (index !== -1) {
          state.conversations[index] = action.payload.data;
        }
        
        // Update current conversation if it's the same
        if (state.currentConversation && state.currentConversation.id === action.payload.data.id) {
          state.currentConversation = action.payload.data;
        }
      })
      .addCase(updateConversationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.data;
        state.totalMessages = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
        
        // Update unread count in current conversation
        if (state.currentConversation) {
          state.currentConversation.unreadCount = 0;
          
          // Also update in the conversations list
          const index = state.conversations.findIndex(c => c.id === state.currentConversation?.id);
          if (index !== -1) {
            state.conversations[index].unreadCount = 0;
          }
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Send message
      .addCase(sendNewMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendNewMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Add message to the list
        state.messages = [action.payload.data, ...state.messages];
        state.totalMessages += 1;
        
        // Update last message in conversation
        if (state.currentConversation) {
          state.currentConversation.lastMessage = action.payload.data;
          
          // Also update in the conversations list
          const index = state.conversations.findIndex(c => c.id === state.currentConversation?.id);
          if (index !== -1) {
            state.conversations[index].lastMessage = action.payload.data;
            
            // Move this conversation to the top of the list
            const conversation = state.conversations[index];
            state.conversations.splice(index, 1);
            state.conversations.unshift(conversation);
          }
        }
      })
      .addCase(sendNewMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Mark as delivered
      .addCase(markAsDelivered.fulfilled, (state, action) => {
        // Update message status in the list
        const messageId = action.payload.data.message;
        const index = state.messages.findIndex(m => m.id === messageId);
        
        if (index !== -1) {
          state.messages[index].status = 'delivered';
        }
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        // Update message status in the list
        const messageId = action.payload.data.message;
        const index = state.messages.findIndex(m => m.id === messageId);
        
        if (index !== -1) {
          state.messages[index].status = 'read';
          
          // Add current user to readBy array if not already there
          const currentUserId = action.meta.arg; // This is the user ID who marked as read
          if (!state.messages[index].readBy.includes(currentUserId)) {
            state.messages[index].readBy.push(currentUserId);
          }
        }
      });
  },
});

export const { clearCurrentConversation, clearMessageError } = messageSlice.actions;

export default messageSlice.reducer;
