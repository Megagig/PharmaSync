import React, { useState } from 'react';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-toastify';
// Removed unused imports

const GeneralSettings: React.FC = () => {
  // We'll use the user state later when implementing user-specific settings
  // const { user } = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const [currency, setCurrency] = useState('NGN');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [language, setLanguage] = useState('en');

  const handleSaveSettings = () => {
    // In a real app, this would save the settings to the server
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Appearance</h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <span className="text-sm font-medium text-gray-700">Theme</span>
              <div className="mt-2 sm:mt-0">
                <div className="flex items-center">
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                    onClick={toggleTheme}
                  >
                    <span className="sr-only">Toggle theme</span>
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-sm text-gray-500">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Regional Settings
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <label
                htmlFor="currency"
                className="text-sm font-medium text-gray-700"
              >
                Currency
              </label>
              <div className="mt-2 sm:mt-0 sm:w-64">
                <select
                  id="currency"
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <label
                htmlFor="dateFormat"
                className="text-sm font-medium text-gray-700"
              >
                Date Format
              </label>
              <div className="mt-2 sm:mt-0 sm:w-64">
                <select
                  id="dateFormat"
                  name="dateFormat"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <label
                htmlFor="timeFormat"
                className="text-sm font-medium text-gray-700"
              >
                Time Format
              </label>
              <div className="mt-2 sm:mt-0 sm:w-64">
                <select
                  id="timeFormat"
                  name="timeFormat"
                  value={timeFormat}
                  onChange={(e) => setTimeFormat(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="12h">12-hour (AM/PM)</option>
                  <option value="24h">24-hour</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <label
                htmlFor="language"
                className="text-sm font-medium text-gray-700"
              >
                Language
              </label>
              <div className="mt-2 sm:mt-0 sm:w-64">
                <select
                  id="language"
                  name="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;
