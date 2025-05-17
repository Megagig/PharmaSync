import React, { useState } from 'react';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { toast } from 'react-toastify';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    inApp: {
      followUpReminders: true,
      drugTherapyProblems: true,
      carePlanUpdates: true,
      inventoryAlerts: true,
      systemUpdates: false,
    },
    email: {
      followUpReminders: true,
      drugTherapyProblems: true,
      carePlanUpdates: false,
      inventoryAlerts: false,
      systemUpdates: false,
    },
    emailDigest: 'daily',
  });
  
  const handleToggle = (category: 'inApp' | 'email', setting: string) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: !settings[category][setting as keyof typeof settings.inApp],
      },
    });
  };
  
  const handleEmailDigestChange = (value: string) => {
    setSettings({
      ...settings,
      emailDigest: value,
    });
  };
  
  const handleSaveSettings = () => {
    // In a real app, this would save the settings to the server
    toast.success('Notification settings saved successfully');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">In-App Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Follow-up Reminders</span>
              <div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.inApp.followUpReminders ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleToggle('inApp', 'followUpReminders')}
                >
                  <span className="sr-only">Toggle follow-up reminders</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.inApp.followUpReminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Drug Therapy Problems</span>
              <div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.inApp.drugTherapyProblems ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleToggle('inApp', 'drugTherapyProblems')}
                >
                  <span className="sr-only">Toggle drug therapy problems</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.inApp.drugTherapyProblems ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Care Plan Updates</span>
              <div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.inApp.carePlanUpdates ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleToggle('inApp', 'carePlanUpdates')}
                >
                  <span className="sr-only">Toggle care plan updates</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.inApp.carePlanUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Inventory Alerts</span>
              <div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.inApp.inventoryAlerts ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleToggle('inApp', 'inventoryAlerts')}
                >
                  <span className="sr-only">Toggle inventory alerts</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.inApp.inventoryAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">System Updates</span>
              <div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.inApp.systemUpdates ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleToggle('inApp', 'systemUpdates')}
                >
                  <span className="sr-only">Toggle system updates</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.inApp.systemUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Follow-up Reminders</span>
              <div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.email.followUpReminders ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleToggle('email', 'followUpReminders')}
                >
                  <span className="sr-only">Toggle follow-up reminders</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.email.followUpReminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Drug Therapy Problems</span>
              <div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.email.drugTherapyProblems ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleToggle('email', 'drugTherapyProblems')}
                >
                  <span className="sr-only">Toggle drug therapy problems</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.email.drugTherapyProblems ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Care Plan Updates</span>
              <div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.email.carePlanUpdates ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleToggle('email', 'carePlanUpdates')}
                >
                  <span className="sr-only">Toggle care plan updates</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.email.carePlanUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Inventory Alerts</span>
              <div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.email.inventoryAlerts ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleToggle('email', 'inventoryAlerts')}
                >
                  <span className="sr-only">Toggle inventory alerts</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.email.inventoryAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">System Updates</span>
              <div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.email.systemUpdates ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleToggle('email', 'systemUpdates')}
                >
                  <span className="sr-only">Toggle system updates</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.email.systemUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <label htmlFor="emailDigest" className="block text-sm font-medium text-gray-700">
                Email Digest Frequency
              </label>
              <select
                id="emailDigest"
                name="emailDigest"
                value={settings.emailDigest}
                onChange={(e) => handleEmailDigestChange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
