// bluesky.ts

// Type for a single post retrieved from the Bluesky API
export interface BlueskyPost {
  uri: string;
  cid: string;
  text: string;
  createdAt: string;
  hasImage: boolean;
  hasVideo: boolean;
  embed?: {
    images?: Array<{
      fullsize: string;
      alt: string;
    }>;
    media?: {
      type: 'video';
      url: string;
    };
  };
  originalAuthor?: {
    handle: string;
    displayName: string;
  };
  isRepost?: boolean;
  repostUri?: string;
}

// Type for the user profile retrieved from Bluesky
export interface UserProfile {
  handle: string; // User's unique handle
  displayName?: string; // User's display name (optional)
}

// Type for an error response from the Bluesky API
export interface ApiErrorResponse {
  error: string; // Error message
  status: number; // HTTP status code
}
