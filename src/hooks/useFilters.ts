import { useState, useCallback } from 'react';
import type { FilterState, FilterActions, ContentType } from '../types/filters';

const initialState: FilterState = {
  contentTypes: [],
  dateRange: undefined,
  mediaType: 'all',
  searchText: '',
};

export const useFilters = (): [FilterState, FilterActions] => {
  const [filters, setFilters] = useState<FilterState>(initialState);

  const actions: FilterActions = {
    setContentTypes: useCallback((types: ContentType[]) => {
      setFilters(prev => ({ ...prev, contentTypes: types }));
    }, []),

    setDateRange: useCallback((range?: { start?: Date; end?: Date }) => {
      setFilters(prev => ({ ...prev, dateRange: range }));
    }, []),

    setMediaType: useCallback((type: string) => {
      setFilters(prev => ({ ...prev, mediaType: type }));
    }, []),

    setSearchText: useCallback((text: string) => {
      setFilters(prev => ({ ...prev, searchText: text }));
    }, []),

    resetFilters: useCallback(() => {
      setFilters(initialState);
    }, []),
  };

  return [filters, actions];
};