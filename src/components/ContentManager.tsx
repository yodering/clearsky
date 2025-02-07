import React, { useState } from 'react';
import { PostList } from './posts/PostList';
import { RepostList } from './posts/RepostList';
import { TabNavigation } from './TabNavigation';

export const ContentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reposts'>('posts');

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'reposts', label: 'Reposts' },
  ];

  return (
    <div className="space-y-6">
      <TabNavigation
        tabs={tabs as Array<{ id: 'posts' | 'reposts'; label: string }>}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as 'posts' | 'reposts')}
      />
      <div className="mt-6">
        {activeTab === 'posts' ? <PostList /> : <RepostList />}
      </div>
    </div>
  );
};