import React from 'react';
import { FilterChip } from './FilterChip';
import type { FilterState } from '../../types/filters';

interface FilterToolbarProps {
  filters: FilterState;
  onOpenFilters: () => void;
  onDeleteAll: () => void;
  totalItems: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onOpenFilters,
  onDeleteAll,
  totalItems,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          onClick={onOpenFilters}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 12h18M3 20h18" />
          </svg>
          Filter
        </button>
        {filters.contentTypes.map(type => (
          <FilterChip key={type} label={type} />
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {totalItems} items
        </span>
        <button
          onClick={onDeleteAll}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
        >
          Delete all
        </button>
      </div>
    </div>
  );
};