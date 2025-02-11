import React, { useEffect, useState } from 'react';
import { PostService } from '../../services/posts/postService';
import { FilterPanel } from '../FilterPanel';
import { PostItem } from './PostItem';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { BlueskyPost } from '../../types/bluesky';
import type { FilterOptions } from '../../types/filters';

export const LikedPostList: React.FC = () => {
  const [likedPosts, setLikedPosts] = useState<BlueskyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [postsToUnlike, setPostsToUnlike] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchLikedPosts = async () => {
      try {
        setError(null);
        // Assuming PostService.getLikedPosts exists and accepts filter options
        const posts = await PostService.getLikedPosts(filters);
        if (mounted) setLikedPosts(posts);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to fetch liked posts');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    setLoading(true);
    fetchLikedPosts();

    return () => {
      mounted = false;
    };
  }, [filters]);

  const handleSelectAll = () => {
    if (selectedPosts.size === likedPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(likedPosts.map(post => post.uri)));
    }
  };

  const handleSelectPost = (uri: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(uri)) newSelected.delete(uri);
    else newSelected.add(uri);
    setSelectedPosts(newSelected);
  };

  const handleUnlike = async (uris: string[]) => {
    try {
      setError(null);
      for (const uri of uris) {
        // Assuming unlikePost function exists in PostService to handle unliking
        await PostService.unlikePost(uri);
      }
      setLikedPosts(likedPosts.filter(post => !uris.includes(post.uri)));
      setSelectedPosts(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlike posts');
    }
  };

  const confirmUnlike = (uris: string[]) => {
    setPostsToUnlike(uris);
    setShowConfirmation(true);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <FilterPanel filters={filters} onFilterChange={setFilters} />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Liked Posts ({likedPosts.length})</h2>
          {likedPosts.length > 0 && (
            <button onClick={handleSelectAll} className="text-sm text-blue-600 hover:text-blue-800">
              {selectedPosts.size === likedPosts.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
        {selectedPosts.size > 0 && (
          <button
            onClick={() => confirmUnlike(Array.from(selectedPosts))}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Unlike Selected ({selectedPosts.size})
          </button>
        )}
      </div>

      {likedPosts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No liked posts found matching your filters
        </div>
      ) : (
        <div className="space-y-4">
          {likedPosts.map((post) => (
            <PostItem
              key={post.uri}
              post={post}
              isSelected={selectedPosts.has(post.uri)}
              onSelect={handleSelectPost}
              onDelete={(uri) => confirmUnlike([uri])}
            />
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {
          handleUnlike(postsToUnlike);
          setShowConfirmation(false);
        }}
        title="Confirm Unlike"
        message={`Are you sure you want to unlike ${postsToUnlike.length} post${postsToUnlike.length === 1 ? '' : 's'}?`}
      />
    </div>
  );
};
