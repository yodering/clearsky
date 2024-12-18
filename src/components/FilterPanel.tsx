import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import type { FilterOptions } from '../types/bluesky';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const [searchInput, setSearchInput] = useState(filters.searchText || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (filters.searchText !== debouncedSearch && debouncedSearch.trim() !== '') {
      onFilterChange({ ...filters, searchText: debouncedSearch });
    }
  }, [debouncedSearch, filters, onFilterChange]);

  const handleChange = (field: keyof FilterOptions, value: any) => {
    if (field === 'searchText') {
      setSearchInput(value);
    } else {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter Posts</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate?.toISOString().split('T')[0] || ''}
            onChange={(e) =>
              handleChange('startDate', e.target.value ? new Date(e.target.value) : undefined)
            }
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate?.toISOString().split('T')[0] || ''}
            onChange={(e) =>
              handleChange('endDate', e.target.value ? new Date(e.target.value) : undefined)
            }
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts..."
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Media Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
          <select
            value={filters.mediaType || 'all'}
            onChange={(e) => handleChange('mediaType', e.target.value)}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
          >
            <option value="all">All Posts</option>
            <option value="images">Images</option>
            <option value="videos">Videos</option>
          </select>
        </div>
      </div>
    </div>
  );
};
