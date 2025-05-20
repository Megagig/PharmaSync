import { useState, useEffect } from 'react';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Switch from '@/components/common/Switch/Switch';
import { useToast } from '@/hooks/useToast';
import {
  getExpiryNotificationSettings,
  updateExpiryNotificationSettings,
  sendExpiryNotifications,
  ExpiryNotificationSettings as ExpirySettings
} from '@/services/settingsService';



const ExpiryNotificationSettings = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ExpirySettings>({
    enabled: false,
    emailRecipients: [],
    notificationDays: [30, 60, 90],
    sendTime: '08:00',
    includeInventoryReport: true,
  });
  const [newRecipient, setNewRecipient] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getExpiryNotificationSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Error fetching notification settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await updateExpiryNotificationSettings(settings);
      showToast('Notification settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Error saving notification settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      setIsSaving(true);
      const result = await sendExpiryNotifications();
      showToast(result.message || 'Test notification sent successfully', 'success');
    } catch (error) {
      console.error('Error sending test notification:', error);
      showToast('Error sending test notification', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRecipient = () => {
    if (!newRecipient) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Check if email already exists
    if (settings.emailRecipients.includes(newRecipient)) {
      showToast('This email is already in the list', 'error');
      return;
    }

    setSettings({
      ...settings,
      emailRecipients: [...settings.emailRecipients, newRecipient],
    });
    setNewRecipient('');
  };

  const handleRemoveRecipient = (email: string) => {
    setSettings({
      ...settings,
      emailRecipients: settings.emailRecipients.filter(e => e !== email),
    });
  };

  const handleToggleDay = (day: number) => {
    if (settings.notificationDays.includes(day)) {
      setSettings({
        ...settings,
        notificationDays: settings.notificationDays.filter(d => d !== day),
      });
    } else {
      setSettings({
        ...settings,
        notificationDays: [...settings.notificationDays, day].sort((a, b) => a - b),
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Expiry Notification Settings
          </h2>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Expiry Notification Settings
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium text-gray-900">Enable Email Notifications</h3>
              <p className="text-sm text-gray-500">
                Receive email notifications about expiring products
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onChange={() => setSettings({ ...settings, enabled: !settings.enabled })}
            />
          </div>

          {settings.enabled && (
            <>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Email Recipients</h3>
                <div className="flex space-x-2 mb-2">
                  <Input
                    placeholder="Enter email address"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleAddRecipient}
                  >
                    Add
                  </Button>
                </div>

                {settings.emailRecipients.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    {settings.emailRecipients.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm">{email}</span>
                        <Button
                          variant="text"
                          size="sm"
                          onClick={() => handleRemoveRecipient(email)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    No recipients added yet. Add at least one email to receive notifications.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Notification Days</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Select when to receive notifications before products expire
                </p>

                <div className="flex flex-wrap gap-2">
                  {[7, 14, 30, 60, 90].map((day) => (
                    <div
                      key={day}
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                        settings.notificationDays.includes(day)
                          ? 'bg-primary-100 text-primary-800 border border-primary-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}
                      onClick={() => handleToggleDay(day)}
                    >
                      {day} days
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Notification Time</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Select when during the day to send notifications
                </p>

                <Input
                  type="time"
                  value={settings.sendTime}
                  onChange={(e) => setSettings({ ...settings, sendTime: e.target.value })}
                  className="w-40"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Include Inventory Report</h3>
                  <p className="text-sm text-gray-500">
                    Attach a full inventory report with the notification email
                  </p>
                </div>
                <Switch
                  checked={settings.includeInventoryReport}
                  onChange={() => setSettings({
                    ...settings,
                    includeInventoryReport: !settings.includeInventoryReport
                  })}
                />
              </div>
            </>
          )}

          <div className="flex justify-end pt-4 space-x-3">
            {settings.enabled && settings.emailRecipients.length > 0 && (
              <Button
                variant="outline"
                onClick={handleSendTestNotification}
                isLoading={isSaving}
                disabled={!settings.enabled || settings.emailRecipients.length === 0}
              >
                Send Test Notification
              </Button>
            )}
            <Button
              variant="primary"
              onClick={saveSettings}
              isLoading={isSaving}
              disabled={!settings.enabled || settings.emailRecipients.length === 0}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExpiryNotificationSettings;
