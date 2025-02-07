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
          // Skip items that do not have a valid post object.
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

          // Check if the feed item represents a repost.
          const isRepost =
            (record as { $type?: string }).$type === 'app.bsky.feed.repost' ||
            reason?.$type === 'app.bsky.feed.defs#reasonRepost';
          if (!isRepost) continue;

          // For a direct repost, the reposted content is in record.subject.
          // Otherwise, use the record itself.
          const repostedContent =
            (record as { $type?: string }).$type === 'app.bsky.feed.repost'
              ? (record as { subject: any }).subject
              : record;
          if (!repostedContent) {
            console.warn('Skipping repost: missing reposted content', { uri: post.uri });
            continue;
          }

          // Determine the original author.
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
          // Wrap the repost record in an object with a "post" key.
          // Use a double-cast (via unknown) to bypass TypeScript's structural check.
          const mappedPost = await PostMapperService.mapPostFromResponse(
            ({ post: { ...post, record: repostedContent } } as unknown) as AppBskyFeedDefs.PostView,
            agent
          );

          if (!mappedPost) {
            console.warn('Skipping repost: mapping failed', { uri: post.uri });
            continue;
          }

          // Save the repost. Here, repostUri is assumed to be the repost record's URI.
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

  /**
   * Delete (undo) a repost.
   *
   * This method expects the repost URI—that is, the repost record's URI—as stored
   * in your mapped repost object. It extracts the record key (rkey) from the URI and
   * calls the delete record endpoint.
   *
   * Note: Adjust the call if your agent provides a dedicated "undo repost" endpoint.
   */
  static async deletePost(uri: string): Promise<void> {
    const agent = BlueskyAgentService.getInstance();
    BlueskyAgentService.validateSession();

    return BlueskyAgentService.retryOperation(async () => {
      try {
        if (!uri?.startsWith('at://')) {
          throw new ApiError('Invalid repost URI format');
        }

        // Split the URI and remove empty segments (in case there is a trailing slash)
        const parts = uri.split('/').filter(Boolean);
        const rkey = parts.pop();
        if (!rkey) {
          throw new ApiError('Invalid repost URI format: missing record key');
        }
        const repo = agent.session!.did; // Typically your DID

        console.log(
          'Attempting to delete repost:',
          { repo, collection: 'app.bsky.feed.post', rkey }
        );

        if (!agent.api?.com?.atproto?.repo?.deleteRecord) {
          throw new ApiError('agent.api.com.atproto.repo.deleteRecord is not available');
        }

        const result = await agent.api.com.atproto.repo.deleteRecord({
          repo,
          collection: 'app.bsky.feed.post',
          rkey,
        });
        console.log('Delete repost result:', result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message.toLowerCase() : 'unknown error';
        if (
          errorMessage.includes('could not find record') ||
          errorMessage.includes('not found')
        ) {
          console.warn('Repost not found or already deleted; treating as successful:', uri);
          return;
        }
        if (errorMessage.includes('invalid request')) {
          throw new ApiError('Invalid repost URI format');
        }
        throw new ApiError(
          `Failed to delete repost: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }, 'delete repost');
  }
}
