import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  onChange?: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTabId,
  className = '',
  variant = 'default',
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const getTabStyles = (tabId: string) => {
    const isActive = activeTab === tabId;

    switch (variant) {
      case 'pills':
        return isActive
          ? 'bg-primary-100 text-primary-700 font-medium'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100';
      case 'underline':
        return isActive
          ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
          : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
      default:
        return isActive
          ? 'border-primary-500 text-primary-600 font-medium'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
    }
  };

  const getTabsContainerStyles = () => {
    switch (variant) {
      case 'pills':
        return 'flex space-x-2 p-1 bg-gray-50 rounded-lg';
      case 'underline':
        return 'flex space-x-8 border-b border-gray-200';
      default:
        return 'flex space-x-8 border-b border-gray-200';
    }
  };

  const getTabButtonStyles = () => {
    switch (variant) {
      case 'pills':
        return 'px-3 py-2 rounded-md text-sm font-medium';
      case 'underline':
        return 'py-4 px-1 text-sm font-medium';
      default:
        return 'py-4 px-1 text-sm font-medium border-b-2';
    }
  };

  return (
    <div className={className}>
      <div className={getTabsContainerStyles()}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`${getTabButtonStyles()} ${getTabStyles(tab.id)}`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;
