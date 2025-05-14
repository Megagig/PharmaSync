import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchNotifications, markAsRead } from '@/store/slices/notificationSlice';
import { formatDateTime } from '@/utils/date.utils';
import { NotificationType, NotificationPriority } from '@/types/notification.types';

const NotificationBadge = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state: RootState) => state.notifications
  );
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Fetch notifications on component mount
    dispatch(fetchNotifications({ page: 1, limit: 5, isArchived: false }));
    
    // Set up polling for new notifications
    const interval = setInterval(() => {
      if (!isOpen) {
        dispatch(fetchNotifications({ page: 1, limit: 5, isArchived: false }));
      }
    }, 60000); // Poll every minute
    
    return () => clearInterval(interval);
  }, [dispatch, isOpen]);
  
  useEffect(() => {
    // Handle clicks outside the dropdown to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    
    // Fetch latest notifications when opening the dropdown
    if (!isOpen) {
      dispatch(fetchNotifications({ page: 1, limit: 5, isArchived: false }));
    }
  };
  
  const handleNotificationClick = (id: string, link?: string) => {
    // Mark notification as read
    dispatch(markAsRead(id));
    
    // Navigate to the link if provided
    if (link) {
      navigate(link);
    }
    
    // Close the dropdown
    setIsOpen(false);
  };
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SYSTEM:
      case NotificationType.MAINTENANCE:
        return (
          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case NotificationType.NEW_MESSAGE:
        return (
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case NotificationType.LOW_STOCK:
      case NotificationType.STOCK_EXPIRING:
      case NotificationType.REORDER_POINT:
        return (
          <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case NotificationType.ORDER_CREATED:
      case NotificationType.ORDER_UPDATED:
      case NotificationType.ORDER_APPROVED:
      case NotificationType.ORDER_REJECTED:
      case NotificationType.ORDER_RECEIVED:
        return (
          <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case NotificationType.PRESCRIPTION_CREATED:
      case NotificationType.PRESCRIPTION_UPDATED:
      case NotificationType.PRESCRIPTION_FILLED:
      case NotificationType.PRESCRIPTION_REFILL_DUE:
        return (
          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case NotificationType.SHIFT_ASSIGNED:
      case NotificationType.SHIFT_UPDATED:
      case NotificationType.SHIFT_REMINDER:
      case NotificationType.TIME_OFF_REQUEST:
      case NotificationType.TIME_OFF_APPROVED:
      case NotificationType.TIME_OFF_REJECTED:
        return (
          <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };
  
  const getPriorityClass = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'bg-red-100 border-red-500';
      case NotificationPriority.HIGH:
        return 'bg-orange-100 border-orange-500';
      case NotificationPriority.MEDIUM:
        return 'bg-blue-100 border-blue-500';
      case NotificationPriority.LOW:
        return 'bg-gray-100 border-gray-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-xs text-primary-600 hover:text-primary-800"
                >
                  View All
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="px-4 py-2 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-2 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-l-4 ${
                      notification.isRead ? 'bg-white' : 'bg-gray-50'
                    } ${getPriorityClass(notification.priority)} hover:bg-gray-100 cursor-pointer`}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="px-4 py-2 border-t border-gray-200">
              <button
                onClick={() => navigate('/notifications/preferences')}
                className="w-full text-xs text-left text-gray-500 hover:text-gray-700"
              >
                Notification Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
