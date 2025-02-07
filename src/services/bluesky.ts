import { BskyAgent, AppBskyEmbedImages, AppBskyEmbedRecordWithMedia, AppBskyFeedDefs, AppBskyEmbedRecord } from '@atproto/api';
import type { BlueskyPost } from '../types/bluesky';
import { ApiError } from './errors/ApiError';
import { RetryService } from './utils/retryService';

export class BlueskyService {
  private agent: BskyAgent;

  constructor(agent: BskyAgent) {
    this.agent = agent;
  }

  private validateSession(): void {
    if (!this.agent.session) {
      throw new ApiError('Not authenticated', 401);
    }
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await RetryService.retry(operation);
    } catch (error) {
      console.error(`Error ${errorMessage}:`, error);
      throw error instanceof Error
        ? new ApiError(error.message)
        : new ApiError(`Failed to ${errorMessage}`);
    }
  }

  private getEmbedData(embed: AppBskyFeedDefs.PostView['embed']) {
    const hasImage = AppBskyEmbedImages.isView(embed) || 
                    (AppBskyEmbedRecordWithMedia.isView(embed) && 
                     AppBskyEmbedImages.isView(embed?.media));
    
    const hasVideo = AppBskyEmbedRecordWithMedia.isView(embed) && 
                    embed?.media?.type === 'video';

    if (!hasImage && !hasVideo) return undefined;

    return {
      images: hasImage ? this.getImageData(embed) : undefined,
      media: hasVideo ? this.getVideoData(embed) : undefined
    };
  }

  private getImageData(embed: AppBskyFeedDefs.PostView['embed']) {
    if (AppBskyEmbedImages.isView(embed)) {
      return embed.images.map(img => ({
        fullsize: img.fullsize,
        alt: img.alt,
      }));
    }
    
    if (AppBskyEmbedRecordWithMedia.isView(embed) && AppBskyEmbedImages.isView(embed.media)) {
      return embed.media.images.map(img => ({
        fullsize: img.fullsize,
        alt: img.alt,
      }));
    }
    
    return undefined;
  }

  private getVideoData(embed: AppBskyFeedDefs.PostView['embed']): { type: 'video'; url: string } | undefined {
    if (AppBskyEmbedRecordWithMedia.isView(embed) && embed.media?.type === 'video' && typeof embed.media.url === 'string') {
      return {
        type: 'video',
        url: embed.media.url,
      };
    }
    return undefined;
  }

  private async mapPost(item: AppBskyFeedDefs.FeedViewPost): Promise<BlueskyPost> {
    try {
      const { uri, cid, record, embed } = item.post;

      if (typeof record !== 'object' || record === null) {
        throw new ApiError('Invalid post record: record must be an object');
      }

      if (!('text' in record) || typeof record.text !== 'string' || 
          !('createdAt' in record) || typeof record.createdAt !== 'string') {
        throw new ApiError('Invalid post record: missing or invalid required fields');
      }

      const embedData = embed ? this.getEmbedData(embed) : undefined;

      const isQuote = AppBskyEmbedRecord.isView(embed) && 
                   embed.record?.value !== null &&
                   typeof embed.record?.value === 'object' &&
                   'text' in embed.record.value;

      return {
        uri,
        cid,
        text: record.text,
        createdAt: record.createdAt,
        hasImage: Boolean(embedData?.images),
        hasVideo: Boolean(embedData?.media),
        embed: embedData,
        isQuote,
        quotedPost: isQuote && AppBskyEmbedRecord.isView(embed) &&
        typeof embed.record.uri === 'string' &&
        embed.record.author &&
        typeof embed.record.author === 'object' &&
        'handle' in embed.record.author && typeof embed.record.author.handle === 'string' ? {
          uri: embed.record.uri,
          text: (embed.record.value as { text: string }).text,
          author: {
            handle: embed.record.author.handle,
            displayName: 'displayName' in embed.record.author && typeof embed.record.author.displayName === 'string' ? embed.record.author.displayName : embed.record.author.handle
          }
        } : undefined
      
      };
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError('Failed to map post data');
    }
  }

  async fetchPosts(cursor?: string): Promise<{ posts: BlueskyPost[]; cursor?: string }> {
    this.validateSession();

    return this.executeWithRetry(async () => {
      const response = await this.agent.getAuthorFeed({
        actor: this.agent.session!.handle,
        limit: 50,
        cursor,
      });

      if (!response.success || !Array.isArray(response.data.feed)) {
        throw new ApiError('Invalid response from server');
      }

      const posts = await Promise.all(
        response.data.feed
          .filter(item => (item.record as { $type?: string })?.$type !== 'app.bsky.feed.repost')
          .map(item => this.mapPost(item))
      );

      return {
        posts,
        cursor: response.data.cursor || undefined,
      };
    }, 'fetch posts');
  }

  async deletePost(uri: string): Promise<void> {
    this.validateSession();
    await this.executeWithRetry(
      () => this.agent.deletePost(uri),
      'delete post'
    );
  }

  async searchPosts(options: {
    startDate?: Date;
    endDate?: Date;
    searchText?: string;
    mediaType?: 'all' | 'images' | 'videos' | 'text-only';
  }): Promise<BlueskyPost[]> {
    this.validateSession();

    try {
      const allPosts: BlueskyPost[] = [];
      let cursor: string | undefined;
      const maxPosts = 200;
      const batchSize = 50;

      const filterPost = (post: BlueskyPost): boolean => {
        const postDate = new Date(post.createdAt);
        return (
          (!options.startDate || postDate >= options.startDate) &&
          (!options.endDate || postDate <= options.endDate) &&
          (!options.searchText ||
            post.text.toLowerCase().includes(options.searchText.toLowerCase())) &&
          (!options.mediaType || options.mediaType === 'all' ||
            (options.mediaType === 'images' && post.embed?.images !== undefined) ||
            (options.mediaType === 'videos' && post.embed?.media?.type === 'video') ||
            (options.mediaType === 'text-only' && !post.embed?.images && !post.embed?.media))
        );
      };

      while (allPosts.length < maxPosts) {
        const { posts, cursor: nextCursor } = await this.fetchPosts(cursor);
        const filteredBatch = posts.filter(filterPost);
        allPosts.push(...filteredBatch);

        if (!nextCursor || filteredBatch.length < batchSize) break;
        cursor = nextCursor;
      }

      return allPosts;
    } catch (error) {
      throw error instanceof Error
        ? new ApiError(error.message)
        : new ApiError('Failed to search posts');
    }
  }
}