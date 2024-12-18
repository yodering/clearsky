import React from 'react';

interface FilterSectionProps {
  title: string;
  onReset?: () => void;
  children: React.ReactNode;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  onReset,
  children,
}) => {
  return (
    <div className="p-4 border-b">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {onReset && (
          <button
            onClick={onReset}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Reset
          </button>
        )}
      </div>
      {children}
    </div>
  );
};