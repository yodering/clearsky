import React, { useState } from 'react';
import { PostList } from './posts/PostList';
import { RepostList } from './posts/RepostList';
import { LikedPostList } from './posts/LikedPostList';
import { TabNavigation } from './TabNavigation';
import type { TabType } from './TabNavigation';

export const ContentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'reposts', label: 'Reposts' },
    { id: 'likes', label: 'Likes' },
  ];

  return (
    <div className="space-y-6">
      <TabNavigation
        tabs={tabs as Array<{ id: TabType; label: string }>}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      <div className="mt-6">
        {activeTab === 'posts' ? <PostList /> :
         activeTab === 'reposts' ? <RepostList /> :
         <LikedPostList />}
      </div>
    </div>
  );
};