import React from 'react';
import type { FilterOptions } from '../../types/bluesky';

interface FilterBarProps {
  filters: FilterOptions;
  onOpenFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onOpenFilters }) => {
  const getMediaLabel = () => {
    switch (filters.mediaType) {
      case 'images': return 'Images';
      case 'videos': return 'Videos';
      case 'text-only': return 'Text only';
      default: return 'Any';
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 overflow-x-auto">
      <button
        onClick={onOpenFilters}
        className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter
      </button>

      <div className="flex gap-2 text-sm">
        <button className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
          Media: {getMediaLabel()}
        </button>
        {(filters.startDate || filters.endDate) && (
          <button className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
            Date: Custom
          </button>
        )}
      </div>
    </div>
  );
};
