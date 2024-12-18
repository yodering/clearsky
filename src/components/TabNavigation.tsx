import React from 'react';

export type TabType = 'posts';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="flex space-x-4 mb-8">
      <button
        onClick={() => onTabChange('posts')}
        className={`px-6 py-2 rounded-lg transition-colors ${
          activeTab === 'posts'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Your Posts
      </button>
    </nav>
  );
};
