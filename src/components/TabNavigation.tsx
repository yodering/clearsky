import React from 'react';

export type TabType = 'posts' | 'reposts';

interface TabNavigationProps {
  tabs: Array<{ id: TabType; label: string }>;
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onChange,
}) => {
  return (
    <nav className="flex space-x-4 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-2 rounded-lg transition-colors ${
            activeTab === tab.id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};
