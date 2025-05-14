import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchNotificationPreferences,
  fetchNotificationTypes,
  updateNotificationPreferencesThunk,
} from '@/store/slices/notificationSlice';
import { NotificationType, NotificationPreferenceUpdateData } from '@/types/notification.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

const NotificationPreferences = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { preferences, notificationTypes, isLoading, error } = useSelector(
    (state: RootState) => state.notifications
  );
  
  const [formData, setFormData] = useState<NotificationPreferenceUpdateData>({
    email: {
      enabled: true,
      types: [],
    },
    inApp: {
      enabled: true,
      types: [],
    },
  });
  
  const [isFormDirty, setIsFormDirty] = useState(false);
  
  useEffect(() => {
    dispatch(fetchNotificationTypes());
    dispatch(fetchNotificationPreferences());
  }, [dispatch]);
  
  useEffect(() => {
    if (preferences) {
      setFormData({
        email: {
          enabled: preferences.email.enabled,
          types: [...preferences.email.types],
        },
        inApp: {
          enabled: preferences.inApp.enabled,
          types: [...preferences.inApp.types],
        },
      });
    }
  }, [preferences]);
  
  const handleToggleEmailEnabled = () => {
    setFormData((prev) => ({
      ...prev,
      email: {
        ...prev.email!,
        enabled: !prev.email?.enabled,
      },
    }));
    setIsFormDirty(true);
  };
  
  const handleToggleInAppEnabled = () => {
    setFormData((prev) => ({
      ...prev,
      inApp: {
        ...prev.inApp!,
        enabled: !prev.inApp?.enabled,
      },
    }));
    setIsFormDirty(true);
  };
  
  const handleToggleEmailType = (type: NotificationType) => {
    setFormData((prev) => {
      const types = prev.email?.types || [];
      const newTypes = types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type];
      
      return {
        ...prev,
        email: {
          ...prev.email!,
          types: newTypes,
        },
      };
    });
    setIsFormDirty(true);
  };
  
  const handleToggleInAppType = (type: NotificationType) => {
    setFormData((prev) => {
      const types = prev.inApp?.types || [];
      const newTypes = types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type];
      
      return {
        ...prev,
        inApp: {
          ...prev.inApp!,
          types: newTypes,
        },
      };
    });
    setIsFormDirty(true);
  };
  
  const handleSelectAllEmailTypes = () => {
    setFormData((prev) => ({
      ...prev,
      email: {
        ...prev.email!,
        types: [...notificationTypes],
      },
    }));
    setIsFormDirty(true);
  };
  
  const handleSelectAllInAppTypes = () => {
    setFormData((prev) => ({
      ...prev,
      inApp: {
        ...prev.inApp!,
        types: [...notificationTypes],
      },
    }));
    setIsFormDirty(true);
  };
  
  const handleClearAllEmailTypes = () => {
    setFormData((prev) => ({
      ...prev,
      email: {
        ...prev.email!,
        types: [],
      },
    }));
    setIsFormDirty(true);
  };
  
  const handleClearAllInAppTypes = () => {
    setFormData((prev) => ({
      ...prev,
      inApp: {
        ...prev.inApp!,
        types: [],
      },
    }));
    setIsFormDirty(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateNotificationPreferencesThunk(formData));
    setIsFormDirty(false);
  };
  
  const formatNotificationType = (type: NotificationType) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const groupNotificationTypes = () => {
    const groups: { [key: string]: NotificationType[] } = {
      System: [],
      User: [],
      Inventory: [],
      Order: [],
      Prescription: [],
      Patient: [],
      Schedule: [],
      Message: [],
    };
    
    notificationTypes.forEach((type) => {
      if (type.startsWith('SYSTEM') || type.startsWith('MAINTENANCE')) {
        groups.System.push(type);
      } else if (type.startsWith('USER') || type.startsWith('ACCOUNT')) {
        groups.User.push(type);
      } else if (type.startsWith('LOW_STOCK') || type.startsWith('STOCK') || type.startsWith('REORDER')) {
        groups.Inventory.push(type);
      } else if (type.startsWith('ORDER')) {
        groups.Order.push(type);
      } else if (type.startsWith('PRESCRIPTION')) {
        groups.Prescription.push(type);
      } else if (type.startsWith('PATIENT')) {
        groups.Patient.push(type);
      } else if (type.startsWith('SHIFT') || type.startsWith('TIME_OFF')) {
        groups.Schedule.push(type);
      } else if (type.startsWith('NEW_MESSAGE')) {
        groups.Message.push(type);
      } else {
        groups.System.push(type);
      }
    });
    
    // Remove empty groups
    Object.keys(groups).forEach((key) => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });
    
    return groups;
  };
  
  const notificationGroups = groupNotificationTypes();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Notification Preferences</h1>
        <Button variant="outline" onClick={() => navigate('/notifications')}>
          Back to Notifications
        </Button>
      </div>

      <Card>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {isLoading && !preferences ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading preferences...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Email Notifications */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Email Notifications</h2>
                      <p className="text-sm text-gray-500">
                        Configure which notifications you want to receive via email
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-gray-500">
                        {formData.email?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                          formData.email?.enabled ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                        onClick={handleToggleEmailEnabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            formData.email?.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {formData.email?.enabled && (
                    <div>
                      <div className="flex justify-end space-x-2 mb-2">
                        <button
                          type="button"
                          className="text-xs text-primary-600 hover:text-primary-800"
                          onClick={handleSelectAllEmailTypes}
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          className="text-xs text-gray-600 hover:text-gray-800"
                          onClick={handleClearAllEmailTypes}
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(notificationGroups).map(([group, types]) => (
                          <div key={`email-${group}`} className="border rounded-md p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">{group}</h3>
                            <div className="space-y-2">
                              {types.map((type) => (
                                <div key={`email-${type}`} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`email-${type}`}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={formData.email?.types.includes(type)}
                                    onChange={() => handleToggleEmailType(type)}
                                  />
                                  <label htmlFor={`email-${type}`} className="ml-2 block text-sm text-gray-900">
                                    {formatNotificationType(type)}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* In-App Notifications */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">In-App Notifications</h2>
                      <p className="text-sm text-gray-500">
                        Configure which notifications you want to receive within the application
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-gray-500">
                        {formData.inApp?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                          formData.inApp?.enabled ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                        onClick={handleToggleInAppEnabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            formData.inApp?.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {formData.inApp?.enabled && (
                    <div>
                      <div className="flex justify-end space-x-2 mb-2">
                        <button
                          type="button"
                          className="text-xs text-primary-600 hover:text-primary-800"
                          onClick={handleSelectAllInAppTypes}
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          className="text-xs text-gray-600 hover:text-gray-800"
                          onClick={handleClearAllInAppTypes}
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(notificationGroups).map(([group, types]) => (
                          <div key={`inapp-${group}`} className="border rounded-md p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">{group}</h3>
                            <div className="space-y-2">
                              {types.map((type) => (
                                <div key={`inapp-${type}`} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`inapp-${type}`}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={formData.inApp?.types.includes(type)}
                                    onChange={() => handleToggleInAppType(type)}
                                  />
                                  <label htmlFor={`inapp-${type}`} className="ml-2 block text-sm text-gray-900">
                                    {formatNotificationType(type)}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  variant="outline"
                  type="button"
                  className="mr-3"
                  onClick={() => navigate('/notifications')}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isLoading}
                  disabled={!isFormDirty}
                >
                  Save Preferences
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
