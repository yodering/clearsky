import React from 'react';

interface FilterChipProps {
  label: string;
  onRemove?: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm">
      <span className="capitalize">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      )}
    </div>
  );
};