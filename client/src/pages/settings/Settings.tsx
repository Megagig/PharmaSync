import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import GeneralSettings from './GeneralSettings';
import IntegrationSettings from './IntegrationSettings';
import NotificationSettings from './NotificationSettings';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Settings: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
          <Tab.List className="flex p-1 space-x-1 bg-gray-100 rounded-t-lg">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'hover:bg-white/[0.12] hover:text-gray-900'
                )
              }
            >
              General
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'hover:bg-white/[0.12] hover:text-gray-900'
                )
              }
            >
              Integrations
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'hover:bg-white/[0.12] hover:text-gray-900'
                )
              }
            >
              Notifications
            </Tab>
          </Tab.List>
          <Tab.Panels className="p-6">
            <Tab.Panel>
              <GeneralSettings />
            </Tab.Panel>
            <Tab.Panel>
              <IntegrationSettings />
            </Tab.Panel>
            <Tab.Panel>
              <NotificationSettings />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Settings;
