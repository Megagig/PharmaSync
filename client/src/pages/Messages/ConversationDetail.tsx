import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchConversationById,
  fetchMessages,
  sendNewMessage,
  updateConversationById,
  clearCurrentConversation,
} from '@/store/slices/messageSlice';
import { fetchUsers } from '@/store/slices/userSlice';
import { formatDateTime } from '@/utils/date.utils';
import { MessageCreateData, ConversationUpdateData } from '@/types/message.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';

const ConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentConversation, messages, isLoading, error } = useSelector(
    (state: RootState) => state.messages
  );
  
  const { users } = useSelector((state: RootState) => state.users);
  const { currentUser } = useSelector((state: RootState) => state.auth);
  
  const [messageContent, setMessageContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchConversationById(id));
      dispatch(fetchMessages({ conversationId: id, filters: { page: 1, limit: 50 } }));
      dispatch(fetchUsers({ page: 1, limit: 100 }));
    }
    
    return () => {
      dispatch(clearCurrentConversation());
    };
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentConversation) {
      setConversationTitle(currentConversation.title || '');
      setSelectedUsers(
        currentConversation.participants
          .filter((p: any) => p.id !== currentUser?.id)
          .map((p: any) => p.id)
      );
    }
  }, [currentConversation, currentUser]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageContent.trim() || !id) return;
    
    const messageData: MessageCreateData = {
      content: messageContent.trim(),
    };
    
    dispatch(sendNewMessage({ conversationId: id, data: messageData }))
      .unwrap()
      .then(() => {
        setMessageContent('');
      })
      .catch((error) => {
        console.error('Failed to send message:', error);
      });
  };
  
  const handleUpdateConversation = () => {
    if (!id || !currentConversation) return;
    
    // Only allow updates to group conversations
    if (!currentConversation.isGroup) {
      setShowEditModal(false);
      return;
    }
    
    const updateData: ConversationUpdateData = {
      title: conversationTitle,
      participants: [...selectedUsers, currentUser?.id || ''],
    };
    
    dispatch(updateConversationById({ id, data: updateData }))
      .unwrap()
      .then(() => {
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error('Failed to update conversation:', error);
      });
  };
  
  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const getConversationName = () => {
    if (!currentConversation) return 'Loading...';
    
    if (currentConversation.title) {
      return currentConversation.title;
    }
    
    // For direct conversations, show the other participant's name
    if (!currentConversation.isGroup) {
      const otherParticipant = currentConversation.participants.find(
        (p: any) => p.id !== currentUser?.id
      );
      return otherParticipant
        ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
        : 'Unknown User';
    }
    
    // For group conversations without a title, show participants' names
    return currentConversation.participants
      .filter((p: any) => p.id !== currentUser?.id)
      .slice(0, 3)
      .map((p: any) => p.firstName)
      .join(', ') +
      (currentConversation.participants.length > 4 ? ` and ${currentConversation.participants.length - 4} others` : '');
  };
  
  const getInitials = (user: any) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };
  
  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    
    // Generate a consistent color based on the user ID
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + acc;
    }, 0);
    
    return colors[hash % colors.length];
  };
  
  const filteredUsers = users.filter((user) => {
    if (user.id === currentUser?.id) return false;
    
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const term = searchTerm.toLowerCase();
    
    return fullName.includes(term) || email.includes(term);
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
        <Button variant="outline" onClick={() => navigate('/messages')}>
          Back to Conversations
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
            </div>
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/messages')}
              >
                View All Conversations
              </Button>
            </div>
          </Card>
        </div>

        <Card className="md:col-span-2">
          {isLoading && !currentConversation ? (
            <div className="p-4 text-center text-gray-500">Loading conversation...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : currentConversation ? (
            <div className="flex flex-col h-[calc(100vh-16rem)]">
              {/* Conversation Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {currentConversation.isGroup ? (
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  ) : (
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white ${
                      getAvatarColor(
                        (currentConversation.participants.find(
                          (p: any) => p.id !== currentUser?.id
                        ) || {}).id || ''
                      )
                    }`}>
                      {getInitials(
                        currentConversation.participants.find(
                          (p: any) => p.id !== currentUser?.id
                        ) || { firstName: '?', lastName: '?' }
                      )}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{getConversationName()}</h3>
                    <p className="text-xs text-gray-500">
                      {currentConversation.participants.length} participants
                    </p>
                  </div>
                </div>
                {currentConversation.isGroup && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                  >
                    Edit Group
                  </Button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isSentByCurrentUser =
                        typeof message.sender === 'string'
                          ? message.sender === currentUser?.id
                          : message.sender.id === currentUser?.id;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-end">
                            {!isSentByCurrentUser && (
                              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white mr-2 ${
                                getAvatarColor(
                                  typeof message.sender === 'string'
                                    ? message.sender
                                    : message.sender.id
                                )
                              }`}>
                                {getInitials(
                                  typeof message.sender === 'string'
                                    ? { firstName: '?', lastName: '?' }
                                    : message.sender
                                )}
                              </div>
                            )}
                            <div
                              className={`px-4 py-2 rounded-lg max-w-xs sm:max-w-md ${
                                isSentByCurrentUser
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs mt-1 text-right opacity-75">
                                {formatDateTime(message.createdAt).split(',')[1]}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!messageContent.trim() || isLoading}
                    isLoading={isLoading}
                  >
                    Send
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">Conversation not found</div>
          )}
        </Card>
      </div>

      {/* Edit Group Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Group"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="conversationTitle" className="block text-sm font-medium text-gray-700">
                Group Name
              </label>
              <input
                type="text"
                id="conversationTitle"
                className="form-input mt-1"
                value={conversationTitle}
                onChange={(e) => setConversationTitle(e.target.value)}
                placeholder="Enter group name"
              />
            </div>

            <div>
              <label htmlFor="searchUsers" className="block text-sm font-medium text-gray-700">
                Search Users
              </label>
              <input
                type="text"
                id="searchUsers"
                className="form-input mt-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return user ? (
                    <div
                      key={userId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {user.firstName} {user.lastName}
                      <button
                        type="button"
                        className="ml-1 text-primary-500 hover:text-primary-700"
                        onClick={() => handleUserSelect(userId)}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-md">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No users found</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <li key={user.id}>
                      <div className="flex items-center px-4 py-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                        />
                        <label
                          htmlFor={`user-${user.id}`}
                          className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {user.firstName} {user.lastName} ({user.email})
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateConversation}
              disabled={selectedUsers.length === 0 || isLoading}
              isLoading={isLoading}
            >
              Update Group
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConversationDetail;
