import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import { useToast } from '@/hooks/useToast';

const AccountingSettings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  // Example settings - in a real app, these would be loaded from the backend
  const [settings, setSettings] = useState({
    general: {
      fiscalYearStart: '01-01',
      defaultCurrency: 'NGN',
      showAccountNumbers: true,
      requireJournalApproval: true,
      allowBackdatedEntries: false,
      lockPeriodAfterClose: true,
    },
    taxes: {
      defaultTaxRate: 7.5,
      automaticallyCalculateTax: true,
      showTaxOnInvoices: true,
    },
    reporting: {
      defaultReportingPeriod: 'monthly',
      includeZeroBalanceAccounts: false,
      showComparativeFigures: true,
    }
  });

  const handleGeneralSettingChange = (name: string, value: any) => {
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [name]: value
      }
    });
  };

  const handleTaxSettingChange = (name: string, value: any) => {
    setSettings({
      ...settings,
      taxes: {
        ...settings.taxes,
        [name]: value
      }
    });
  };

  const handleReportingSettingChange = (name: string, value: any) => {
    setSettings({
      ...settings,
      reporting: {
        ...settings.reporting,
        [name]: value
      }
    });
  };

  const handleSaveSettings = () => {
    // In a real app, this would save settings to the backend
    showToast('Settings saved successfully', 'success');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Accounting Settings</h1>
        <Button
          variant="primary"
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Fiscal Year Start (MM-DD)"
                  name="fiscalYearStart"
                  value={settings.general.fiscalYearStart}
                  onChange={(e) => handleGeneralSettingChange('fiscalYearStart', e.target.value)}
                />
              </div>
              <div>
                <Select
                  label="Default Currency"
                  name="defaultCurrency"
                  value={settings.general.defaultCurrency}
                  onChange={(e) => handleGeneralSettingChange('defaultCurrency', e.target.value)}
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </Select>
              </div>
              <div>
                <Checkbox
                  label="Show Account Numbers"
                  checked={settings.general.showAccountNumbers}
                  onChange={(e) => handleGeneralSettingChange('showAccountNumbers', e.target.checked)}
                />
              </div>
              <div>
                <Checkbox
                  label="Require Journal Entry Approval"
                  checked={settings.general.requireJournalApproval}
                  onChange={(e) => handleGeneralSettingChange('requireJournalApproval', e.target.checked)}
                />
              </div>
              <div>
                <Checkbox
                  label="Allow Backdated Entries"
                  checked={settings.general.allowBackdatedEntries}
                  onChange={(e) => handleGeneralSettingChange('allowBackdatedEntries', e.target.checked)}
                />
              </div>
              <div>
                <Checkbox
                  label="Lock Period After Close"
                  checked={settings.general.lockPeriodAfterClose}
                  onChange={(e) => handleGeneralSettingChange('lockPeriodAfterClose', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Tax Settings */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tax Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Default Tax Rate (%)"
                  name="defaultTaxRate"
                  type="number"
                  step="0.01"
                  value={settings.taxes.defaultTaxRate.toString()}
                  onChange={(e) => handleTaxSettingChange('defaultTaxRate', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Checkbox
                  label="Automatically Calculate Tax"
                  checked={settings.taxes.automaticallyCalculateTax}
                  onChange={(e) => handleTaxSettingChange('automaticallyCalculateTax', e.target.checked)}
                />
              </div>
              <div>
                <Checkbox
                  label="Show Tax on Invoices"
                  checked={settings.taxes.showTaxOnInvoices}
                  onChange={(e) => handleTaxSettingChange('showTaxOnInvoices', e.target.checked)}
                />
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/accounting/taxes')}
                  className="w-full"
                >
                  Manage Tax Configurations
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Reporting Settings */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Reporting Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  label="Default Reporting Period"
                  name="defaultReportingPeriod"
                  value={settings.reporting.defaultReportingPeriod}
                  onChange={(e) => handleReportingSettingChange('defaultReportingPeriod', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </div>
              <div>
                <Checkbox
                  label="Include Zero Balance Accounts"
                  checked={settings.reporting.includeZeroBalanceAccounts}
                  onChange={(e) => handleReportingSettingChange('includeZeroBalanceAccounts', e.target.checked)}
                />
              </div>
              <div>
                <Checkbox
                  label="Show Comparative Figures"
                  checked={settings.reporting.showComparativeFigures}
                  onChange={(e) => handleReportingSettingChange('showComparativeFigures', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccountingSettings;
