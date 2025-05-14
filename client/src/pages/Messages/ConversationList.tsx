import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchConversations, createNewConversation } from '@/store/slices/messageSlice';
import { fetchUsers } from '@/store/slices/userSlice';
import { formatDateTime } from '@/utils/date.utils';
import { ConversationCreateData } from '@/types/message.types';
import { User } from '@/types/user.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';

const ConversationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { conversations, isLoading, error } = useSelector(
    (state: RootState) => state.messages
  );
  
  const { users } = useSelector((state: RootState) => state.users);
  const { currentUser } = useSelector((state: RootState) => state.auth);
  
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [conversationTitle, setConversationTitle] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    dispatch(fetchConversations({ page: 1, limit: 20 }));
    dispatch(fetchUsers({ page: 1, limit: 100 }));
  }, [dispatch]);
  
  const handleCreateConversation = () => {
    if (selectedUsers.length === 0) return;
    
    const conversationData: ConversationCreateData = {
      participants: selectedUsers,
      isGroup: isGroup || selectedUsers.length > 1,
    };
    
    if (isGroup || selectedUsers.length > 1) {
      conversationData.title = conversationTitle || `Group (${selectedUsers.length + 1})`;
    }
    
    dispatch(createNewConversation(conversationData))
      .unwrap()
      .then((result) => {
        setShowNewConversationModal(false);
        setSelectedUsers([]);
        setConversationTitle('');
        setIsGroup(false);
        navigate(`/messages/${result.data.id}`);
      })
      .catch((error) => {
        console.error('Failed to create conversation:', error);
      });
  };
  
  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const getConversationName = (conversation: any) => {
    if (conversation.title) {
      return conversation.title;
    }
    
    // For direct conversations, show the other participant's name
    if (!conversation.isGroup) {
      const otherParticipant = conversation.participants.find(
        (p: any) => p.id !== currentUser?.id
      );
      return otherParticipant
        ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
        : 'Unknown User';
    }
    
    // For group conversations without a title, show participants' names
    return conversation.participants
      .filter((p: any) => p.id !== currentUser?.id)
      .slice(0, 3)
      .map((p: any) => p.firstName)
      .join(', ') +
      (conversation.participants.length > 4 ? ` and ${conversation.participants.length - 4} others` : '');
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
        <Button
          variant="primary"
          onClick={() => setShowNewConversationModal(true)}
        >
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading && conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations yet</div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/messages/${conversation.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    {conversation.isGroup ? (
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    ) : (
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white ${
                        getAvatarColor(
                          (conversation.participants.find(
                            (p: any) => p.id !== currentUser?.id
                          ) || {}).id || ''
                        )
                      }`}>
                        {getInitials(
                          conversation.participants.find(
                            (p: any) => p.id !== currentUser?.id
                          ) || { firstName: '?', lastName: '?' }
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getConversationName(conversation)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conversation.updatedAt
                            ? formatDateTime(conversation.updatedAt).split(',')[0]
                            : ''}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage
                            ? conversation.lastMessage.content
                            : 'No messages yet'}
                        </p>
                        {conversation.unreadCount && conversation.unreadCount > 0 ? (
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-600 text-xs font-medium text-white">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="md:col-span-2">
          <div className="flex flex-col items-center justify-center h-64">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select a conversation from the list or start a new one
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => setShowNewConversationModal(true)}
              >
                New Message
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* New Conversation Modal */}
      <Modal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        title="New Message"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="isGroup" className="block text-sm font-medium text-gray-700">
                  Group Conversation
                </label>
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    isGroup ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => setIsGroup(!isGroup)}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      isGroup ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {isGroup && (
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
            )}

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
                Selected Users ({selectedUsers.length})
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
              onClick={() => setShowNewConversationModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateConversation}
              disabled={selectedUsers.length === 0 || isLoading}
              isLoading={isLoading}
            >
              Start Conversation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConversationList;
