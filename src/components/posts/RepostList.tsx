import React, { useEffect, useState } from 'react';
import { RepostService } from '../../services/posts/repostService';
import { FilterPanel } from '../FilterPanel';
import { PostItem } from './PostItem';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { BlueskyPost } from '../../types/bluesky';
import type { FilterOptions } from '../../types/filters';

export const RepostList: React.FC = () => {
  const [reposts, setReposts] = useState<BlueskyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedReposts, setSelectedReposts] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [repostsToDelete, setRepostsToDelete] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchReposts = async () => {
      try {
        setError(null);
        const filteredReposts = await RepostService.searchReposts(filters);
        if (mounted) {
          setReposts(filteredReposts);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch reposts');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchReposts();

    return () => {
      mounted = false;
    };
  }, [filters]);

  const handleSelectAll = () => {
    if (selectedReposts.size === reposts.length) {
      setSelectedReposts(new Set());
    } else {
      setSelectedReposts(new Set(reposts.map(repost => repost.uri)));
    }
  };

  const handleSelectRepost = (uri: string) => {
    const newSelected = new Set(selectedReposts);
    if (newSelected.has(uri)) {
      newSelected.delete(uri);
    } else {
      newSelected.add(uri);
    }
    setSelectedReposts(newSelected);
  };

  const handleDelete = async (uris: string[]) => {
    try {
      setError(null);
      for (const uri of uris) {
        await RepostService.deletePost(uri);
      }
      setReposts(reposts.filter(repost => !uris.includes(repost.uri)));
      setSelectedReposts(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reposts');
    }
  };

  const confirmDelete = (uris: string[]) => {
    setRepostsToDelete(uris);
    setShowDeleteConfirmation(true);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <FilterPanel filters={filters} onFilterChange={setFilters} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Your Reposts ({reposts.length})</h2>
          {reposts.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedReposts.size === reposts.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {selectedReposts.size > 0 && (
          <button
            onClick={() => confirmDelete(Array.from(selectedReposts))}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
          >
            Delete Selected ({selectedReposts.size})
          </button>
        )}
      </div>

      {reposts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No reposts found
        </div>
      ) : (
        <div className="space-y-4">
          {reposts.map(repost => (
            <PostItem
              onDelete={() => confirmDelete([repost.uri])}
              key={repost.uri}
              post={repost}
              isSelected={selectedReposts.has(repost.uri)}
              onSelect={() => handleSelectRepost(repost.uri)}
            />
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={() => {
          handleDelete(repostsToDelete);
          setShowDeleteConfirmation(false);
        }}
        title="Delete Reposts"
        message={`Are you sure you want to delete ${repostsToDelete.length} repost${repostsToDelete.length === 1 ? '' : 's'}?`}
      />
    </div>
  );
};