import React, { useEffect, useState } from 'react';
import { PostService } from '../../services/posts/postService';
import { FilterPanel } from '../FilterPanel';
import { PostItem } from './PostItem';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { BlueskyPost } from '../../types/bluesky';
import type { FilterOptions } from '../../types/filters';

export const PostList: React.FC = () => {
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [postsToDelete, setPostsToDelete] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      try {
        setError(null);
        const filteredPosts = await PostService.searchPosts(filters);
        if (mounted) {
          setPosts(filteredPosts);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchPosts();

    return () => {
      mounted = false;
    };
  }, [filters]);

  const handleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map(post => post.uri)));
    }
  };

  const handleSelectPost = (uri: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(uri)) {
      newSelected.delete(uri);
    } else {
      newSelected.add(uri);
    }
    setSelectedPosts(newSelected);
  };

  const handleDelete = async (uris: string[]) => {
    try {
      setError(null);
      for (const uri of uris) {
        await PostService.deletePost(uri);
      }
      setPosts(posts.filter(post => !uris.includes(post.uri)));
      setSelectedPosts(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete posts');
    }
  };

  const confirmDelete = (uris: string[]) => {
    setPostsToDelete(uris);
    setShowDeleteConfirmation(true);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <FilterPanel filters={filters} onFilterChange={setFilters} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Your Posts ({posts.length})</h2>
          {posts.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedPosts.size === posts.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
        {selectedPosts.size > 0 && (
          <button
            onClick={() => confirmDelete(Array.from(selectedPosts))}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Selected ({selectedPosts.size})
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No posts found matching your filters
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem
              key={post.uri}
              post={post}
              isSelected={selectedPosts.has(post.uri)}
              onSelect={handleSelectPost}
              onDelete={(uri) => confirmDelete([uri])}
            />
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={() => handleDelete(postsToDelete)}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${postsToDelete.length} post${postsToDelete.length === 1 ? '' : 's'}? This action cannot be undone.`}
      />
    </div>
  );
};