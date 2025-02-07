import type { BlueskyPost } from '../../types/bluesky';
import type { FilterOptions } from '../../types/filters';

import type { AppBskyFeedDefs } from '@atproto/api';

export class PostFilterService {
  static isOwnPost(item: AppBskyFeedDefs.FeedViewPost, userDid: string): boolean {
    return item.post?.author?.did === userDid;
  }

  static applyFilters(posts: BlueskyPost[], filters: FilterOptions): BlueskyPost[] {
    let filteredPosts = [...posts];

    if (filters.startDate || filters.endDate) {
      filteredPosts = this.filterByDate(filteredPosts, filters);
    }

    if (filters.searchText) {
      filteredPosts = this.filterByText(filteredPosts, filters.searchText);
    }

    if (filters.mediaType && filters.mediaType !== 'all') {
      filteredPosts = this.filterByMediaType(filteredPosts, filters.mediaType);
    }

    return filteredPosts;
  }

  private static filterByDate(posts: BlueskyPost[], filters: FilterOptions): BlueskyPost[] {
    return posts.filter(post => {
      const date = new Date(post.createdAt);
      if (filters.startDate && date < filters.startDate) return false;
      if (filters.endDate && date > filters.endDate) return false;
      return true;
    });
  }

  private static filterByText(posts: BlueskyPost[], searchText: string): BlueskyPost[] {
    const lowercaseSearch = searchText.toLowerCase();
    return posts.filter(post => 
      post.text.toLowerCase().includes(lowercaseSearch) ||
      (post.isQuote && post.quotedPost?.text.toLowerCase().includes(lowercaseSearch))
    );
  }

  private static filterByMediaType(posts: BlueskyPost[], mediaType: string): BlueskyPost[] {
    return posts.filter(post => {
      switch (mediaType) {
        case 'images':
          return post.hasImage;
        case 'videos':
          return post.hasVideo;
        case 'text-only':
          return !post.hasImage && !post.hasVideo;
        default:
          return true;
      }
    });
  }
}