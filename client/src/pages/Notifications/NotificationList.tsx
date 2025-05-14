import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotificationById,
  deleteNotificationById,
  fetchNotificationTypes,
} from '@/store/slices/notificationSlice';
import { formatDateTime } from '@/utils/date.utils';
import { NotificationType, NotificationPriority, NotificationFilters } from '@/types/notification.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import Modal from '@/components/common/Modal/Modal';

const NotificationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    notifications,
    notificationTypes,
    isLoading,
    error,
    totalNotifications,
    totalPages,
    currentPage,
  } = useSelector((state: RootState) => state.notifications);
  
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 10,
    isArchived: false,
  });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  
  useEffect(() => {
    dispatch(fetchNotificationTypes());
    loadNotifications();
  }, [dispatch, filters.page]);
  
  const loadNotifications = () => {
    dispatch(fetchNotifications(filters));
  };
  
  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filters change
    }));
  };
  
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };
  
  const handleNotificationClick = (id: string, link?: string) => {
    dispatch(markAsRead(id));
    
    if (link) {
      navigate(link);
    }
  };
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  const handleArchive = (id: string) => {
    dispatch(archiveNotificationById(id));
  };
  
  const handleDelete = () => {
    if (selectedNotificationId) {
      dispatch(deleteNotificationById(selectedNotificationId));
      setShowDeleteModal(false);
      setSelectedNotificationId(null);
    }
  };
  
  const confirmDelete = (id: string) => {
    setSelectedNotificationId(id);
    setShowDeleteModal(true);
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
  
  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Urgent
          </span>
        );
      case NotificationPriority.HIGH:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
            High
          </span>
        );
      case NotificationPriority.MEDIUM:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Medium
          </span>
        );
      case NotificationPriority.LOW:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            Low
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/notifications/preferences')}
          >
            Notification Settings
          </Button>
          <Button
            variant="primary"
            onClick={handleMarkAllAsRead}
            disabled={isLoading}
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="typeFilter"
                className="form-select"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              >
                <option value="">All Types</option>
                {notificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="readFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="readFilter"
                className="form-select"
                value={filters.isRead === undefined ? '' : String(filters.isRead)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    const newFilters = { ...filters };
                    delete newFilters.isRead;
                    setFilters(newFilters);
                  } else {
                    handleFilterChange('isRead', value === 'true');
                  }
                }}
              >
                <option value="">All Status</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>

            <div>
              <label htmlFor="archivedFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Archive
              </label>
              <select
                id="archivedFilter"
                className="form-select"
                value={String(filters.isArchived)}
                onChange={(e) => handleFilterChange('isArchived', e.target.value === 'true')}
              >
                <option value="false">Active</option>
                <option value="true">Archived</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    page: 1,
                    limit: 10,
                    isArchived: false,
                  });
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-md ${
                    notification.isRead ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p 
                            className={`text-sm font-medium ${notification.isRead ? 'text-gray-900' : 'text-black'}`}
                            onClick={() => handleNotificationClick(notification.id, notification.link)}
                            style={{ cursor: 'pointer' }}
                          >
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                          <div className="mt-1 flex items-center space-x-2">
                            <p className="text-xs text-gray-400">
                              {formatDateTime(notification.createdAt)}
                            </p>
                            {getPriorityBadge(notification.priority)}
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {notification.type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => dispatch(markAsRead(notification.id))}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Mark as Read
                            </button>
                          )}
                          {!notification.isArchived ? (
                            <button
                              onClick={() => handleArchive(notification.id)}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              Archive
                            </button>
                          ) : (
                            <button
                              onClick={() => confirmDelete(notification.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No notifications found.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Notification"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to delete this notification? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationList;
