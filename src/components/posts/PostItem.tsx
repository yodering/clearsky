import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import type { BlueskyPost } from '../../types/bluesky';

interface PostItemProps {
  post: BlueskyPost;
  isSelected: boolean;
  onSelect: (uri: string) => void;
  onDelete: (uri: string) => void;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  isSelected,
  onSelect,
  onDelete,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 bg-white rounded-lg shadow"
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(post.uri)}
          className="mt-1"
        />
        <div className="flex-1">
          <p className="mb-2">{post.text}</p>
          {post.isQuote && post.quotedPost && (
            <div className="mb-2 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
              <div className="text-sm text-gray-600 mb-1">
                Quoting @{post.quotedPost.author.handle}
              </div>
              <p className="text-gray-800">{post.quotedPost.text}</p>
            </div>
          )}
          {post.embed?.images && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {post.embed.images.map((img, index) => (
                <img
                  key={index}
                  src={img.fullsize}
                  alt={img.alt}
                  className="rounded-lg max-h-48 object-cover"
                />
              ))}
            </div>
          )}
          {post.embed?.media?.type === 'video' && (
            <video
              src={post.embed.media.url}
              controls
              className="w-full rounded-lg mb-2"
            />
          )}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{format(new Date(post.createdAt), 'PPP')}</span>
            <button
              onClick={() => onDelete(post.uri)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
