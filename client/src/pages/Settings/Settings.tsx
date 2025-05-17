import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-toastify';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import GeneralSettings from '../settings/GeneralSettings';
import IntegrationSettings from '../settings/IntegrationSettings';
import NotificationSettings from '../settings/NotificationSettings';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Settings: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  // State for settings
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save the settings to the server
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Appearance Settings */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Appearance
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <span className="mr-3 text-sm font-medium text-gray-700">
                      Theme:
                    </span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        name="theme"
                        id="theme"
                        className="sr-only"
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                      />
                      <div className="block bg-gray-200 rounded-full h-6 w-12"></div>
                      <div
                        className={`absolute left-1 top-1 bg-white rounded-full h-4 w-4 transition-transform ${
                          theme === 'dark' ? 'transform translate-x-6' : ''
                        }`}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-700">
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="language"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Language
                  </label>
                  <select
                    id="language"
                    className="form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Notifications
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={notificationsEnabled}
                      onChange={() =>
                        setNotificationsEnabled(!notificationsEnabled)
                      }
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable notifications
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={emailNotificationsEnabled}
                      onChange={() =>
                        setEmailNotificationsEnabled(!emailNotificationsEnabled)
                      }
                      disabled={!notificationsEnabled}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Email notifications
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={smsNotificationsEnabled}
                      onChange={() =>
                        setSmsNotificationsEnabled(!smsNotificationsEnabled)
                      }
                      disabled={!notificationsEnabled}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      SMS notifications
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Date & Time Settings */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Date & Time
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="dateFormat"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date Format
                  </label>
                  <select
                    id="dateFormat"
                    className="form-select"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="timeFormat"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Time Format
                  </label>
                  <select
                    id="timeFormat"
                    className="form-select"
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value)}
                  >
                    <option value="12h">12-hour (AM/PM)</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* User Info */}
        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-sm text-gray-900 capitalize">
                    {user?.role}
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = '/profile')}
                    className="w-full"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
