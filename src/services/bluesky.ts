import { BskyAgent, AppBskyEmbedImages, AppBskyEmbedRecordWithMedia } from '@atproto/api';
import type { BlueskyPost, FilterOptions } from '../types/bluesky';

export class BlueskyService {
  private agent: BskyAgent;

  constructor(agent: BskyAgent) {
    this.agent = agent;
  }

  private hasImages(embed: any): boolean {
    return AppBskyEmbedImages.isView(embed) || 
           (AppBskyEmbedRecordWithMedia.isView(embed) && 
            AppBskyEmbedImages.isView(embed?.media));
  }

  private hasVideo(embed: any): boolean {
    return embed?.media?.type === 'video';
  }

  private isRepost(post: any): boolean {
    return post.record.$type === 'app.bsky.feed.repost';
  }

  private async getPostEngagement(uri: string): Promise<{ likeCount: number; repostCount: number; replyCount: number }> {
    try {
      const metrics = await this.agent.getPostEngagement(uri);
      return {
        likeCount: metrics.data.likeCount || 0,
        repostCount: metrics.data.repostCount || 0,
        replyCount: metrics.data.replyCount || 0,
      };
    } catch (error) {
      console.warn(`Failed to fetch engagement metrics for post ${uri}:`, error);
      return {
        likeCount: 0,
        repostCount: 0,
        replyCount: 0,
      };
    }
  }

  async fetchPosts(cursor?: string): Promise<{ posts: BlueskyPost[]; cursor?: string }> {
    if (!this.agent.session) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await this.agent.getAuthorFeed({
        actor: this.agent.session.handle,
        limit: 50,
        cursor,
      });

      const posts = await Promise.all(
        response.data.feed
          .filter(item => !this.isRepost(item.post.record)) // Filter out reposts
          .map(async (item) => {
            const embed = item.post.embed;
            const hasImage = this.hasImages(embed);
            const hasVideo = this.hasVideo(embed);
            const engagement = await this.getPostEngagement(item.post.uri);

            return {
              uri: item.post.uri,
              cid: item.post.cid,
              text: item.post.record.text,
              createdAt: item.post.record.createdAt,
              hasImage,
              hasVideo,
              likeCount: engagement.likeCount,
              repostCount: engagement.repostCount,
              replyCount: engagement.replyCount,
              embed: embed ? {
                images: hasImage ? embed.images?.map((img: any) => ({
                  fullsize: img.fullsize,
                  alt: img.alt,
                })) : undefined,
                media: hasVideo ? {
                  type: embed.media.type,
                  url: embed.media.url,
                } : undefined,
              } : undefined,
            };
          })
      );

      return {
        posts,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }

  async deletePost(uri: string): Promise<void> {
    if (!this.agent.session) {
      throw new Error('Not authenticated');
    }

    try {
      await this.agent.deletePost(uri);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  async searchPosts(options: FilterOptions): Promise<BlueskyPost[]> {
    if (!this.agent.session) {
      throw new Error('Not authenticated');
    }

    try {
      let allPosts: BlueskyPost[] = [];
      let cursor: string | undefined;

      do {
        const { posts, cursor: nextCursor } = await this.fetchPosts(cursor);
        cursor = nextCursor;

        const filteredPosts = posts.filter((post) => {
          const postDate = new Date(post.createdAt);
          const matchesDateRange =
            (!options.startDate || postDate >= options.startDate) &&
            (!options.endDate || postDate <= options.endDate);

          const matchesText = !options.searchText ||
            post.text.toLowerCase().includes(options.searchText.toLowerCase());

          const matchesMediaType = !options.mediaType || options.mediaType === 'all' ||
            (options.mediaType === 'images' && post.hasImage) ||
            (options.mediaType === 'videos' && post.hasVideo) ||
            (options.mediaType === 'text-only' && !post.hasImage && !post.hasVideo);

          const matchesEngagement =
            (!options.minLikes || post.likeCount >= options.minLikes) &&
            (!options.minReposts || post.repostCount >= options.minReposts) &&
            (!options.minReplies || post.replyCount >= options.minReplies);

          return matchesDateRange && matchesText && matchesMediaType && matchesEngagement;
        });

        allPosts = [...allPosts, ...filteredPosts];
      } while (cursor && allPosts.length < 200);

      return allPosts;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw new Error('Failed to search posts');
    }
  }
}