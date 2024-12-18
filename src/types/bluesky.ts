// bluesky.ts

// Type for a single post retrieved from the Bluesky API
export interface BlueskyPost {
  uri: string; // Unique identifier for the post
  text: string; // Post content
  createdAt: string; // Post creation date
  embed?: {
    images?: { fullsize: string; alt?: string }[]; // Array of images with alt text
    media?: { type: 'video'; url: string }; // Video embed details
  } | null; // Optional embed content (images or media)
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
