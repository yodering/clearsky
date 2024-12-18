import React from 'react';
import { PostList } from './posts/PostList';

export const ContentManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mt-6">
        <PostList />
      </div>
    </div>
  );
};