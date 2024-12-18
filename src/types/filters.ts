// filters.ts

// Options for filtering posts
export interface FilterOptions {
  startDate?: Date; // Optional start date for filtering
  endDate?: Date; // Optional end date for filtering
  mediaType?: 'images' | 'videos' | 'text-only' | 'all'; // Type of media to filter by
  searchText?: string; // Text to search within posts
}
