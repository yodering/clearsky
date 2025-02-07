import { BlueskyAgentService } from '../api/blueskyAgent';
import { PostFilterService } from './postFilterService';
import { PostMapperService } from './postMapperService';
import { ApiError } from '../errors/ApiError';
import type { BlueskyPost } from '../../types/bluesky';
import type { FilterOptions } from '../../types/filters';
import { AppBskyFeedDefs } from '@atproto/api';

interface RepostAuthor {
  handle: string;
  displayName: string;
}

export class RepostService {
  /**
   * A simplified method to fetch the user's reposts.
   */
  static async getReposts(): Promise<BlueskyPost[]> {
    const agent = BlueskyAgentService.getInstance();
    BlueskyAgentService.validateSession();

    return BlueskyAgentService.retryOperation(async () => {
      const response = await agent.getAuthorFeed({
        actor: agent.session!.handle,
        filter: 'posts_with_replies',
        limit: 50,
      });

      if (!response?.success || !Array.isArray(response.data?.feed)) {
        console.error('Invalid server response:', { response });
        throw new ApiError('Invalid response from server');
      }

      const reposts: BlueskyPost[] = [];

      for (const item of response.data.feed) {
        try {
          // Skip if there's no valid post object
          if (!item?.post) {
            console.debug('Skipping feed item: missing post', item);
            continue;
          }

          const { post, reason } = item;
          const record = post.record;
          if (!record) {
            console.debug('Skipping feed item: missing record', item);
            continue;
          }

          // Determine whether the item is a repost.
          const isRepost =
            (record as { $type?: string }).$type === 'app.bsky.feed.repost' ||
            reason?.$type === 'app.bsky.feed.defs#reasonRepost';
          if (!isRepost) continue;

          // Extract the reposted content:
          // For direct reposts, it's in record.subject; otherwise, it's the record itself.
          const repostedContent =
            (record as { $type?: string }).$type === 'app.bsky.feed.repost'
              ? (record as { subject: any }).subject
              : record;
          if (!repostedContent) {
            console.warn('Skipping repost: missing reposted content', { uri: post.uri });
            continue;
          }

          // Extract the original author.
          const originalAuthor: RepostAuthor | undefined = (() => {
            if (reason?.$type === 'app.bsky.feed.defs#reasonRepost' && reason.by) {
              const by = reason.by as { handle: string; displayName?: string };
              return {
                handle: by.handle,
                displayName: by.displayName || by.handle,
              };
            } else if (post.author) {
              return {
                handle: post.author.handle,
                displayName: post.author.displayName || post.author.handle,
              };
            }
            return undefined;
          })();

          if (!originalAuthor || !originalAuthor.handle) {
            console.warn('Skipping repost: missing original author', { uri: post.uri });
            continue;
          }

          // IMPORTANT:
          // PostMapperService.mapPostFromResponse expects an object of type AppBskyFeedDefs.PostView.
          // However, our "post" object is nested in { post: ... }.
          // If this conversion is intentional, we can cast via unknown.
          const mappedPost = await PostMapperService.mapPostFromResponse(
            ({ post: { ...post, record: repostedContent } } as unknown) as AppBskyFeedDefs.PostView,
            agent
          );

          if (!mappedPost) {
            console.warn('Skipping repost: mapping failed', { uri: post.uri });
            continue;
          }

          reposts.push({
            ...mappedPost,
            originalAuthor,
            isRepost: true,
            repostUri: post.uri,
          });
        } catch (error) {
          console.error('Error processing feed item:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            item,
          });
        }
      }
      return reposts;
    }, 'fetch reposts');
  }

  static async searchReposts(filters: FilterOptions): Promise<BlueskyPost[]> {
    const reposts = await this.getReposts();
    return PostFilterService.applyFilters(reposts, filters);
  }

  static async deletePost(uri: string): Promise<void> {
    const agent = BlueskyAgentService.getInstance();
    BlueskyAgentService.validateSession();

    return BlueskyAgentService.retryOperation(async () => {
      try {
        if (!uri?.startsWith('at://')) {
          throw new ApiError('Invalid repost URI format');
        }
        await agent.deletePost(uri);
      } catch (error) {
        if (error instanceof ApiError) throw error;

        const errorMessage =
          error instanceof Error ? error.message.toLowerCase() : 'unknown error';

        if (
          errorMessage.includes('could not find repo') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('record not found')
        ) {
          throw new ApiError('Repost not found or already deleted');
        }

        if (errorMessage.includes('invalid request')) {
          throw new ApiError('Invalid repost URI format');
        }

        throw new ApiError(
          `Failed to delete repost: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }, 'delete repost');
  }
}
