import { BlueskyAgentService } from '../api/blueskyAgent';
import { PostFilterService } from './postFilterService';
import { PostMapperService } from './postMapperService';
import { ApiError } from '../errors/ApiError';
import type { BlueskyPost } from '../../types/bluesky';
import type { FilterOptions } from '../../types/filters';

export class PostService {
  static async getPosts(): Promise<BlueskyPost[]> {
    const agent = BlueskyAgentService.getInstance();
    BlueskyAgentService.validateSession();

    return BlueskyAgentService.retryOperation(async () => {
      const response = await agent.getAuthorFeed({
        actor: agent.session!.handle,
        limit: 50,
      });

      if (!response.success || !Array.isArray(response.data.feed)) {
        throw new ApiError('Invalid response from server');
      }

      return Promise.all(
        response.data.feed
          .filter(item => PostFilterService.isOwnPost(item, agent.session!.did))
          .map(item => PostMapperService.mapPostFromResponse(item))
      );
    }, 'fetch posts');
  }

  static async searchPosts(filters: FilterOptions): Promise<BlueskyPost[]> {
    const posts = await this.getPosts();
    return PostFilterService.applyFilters(posts, filters);
  }

  static async deletePost(uri: string): Promise<void> {
    const agent = BlueskyAgentService.getInstance();
    BlueskyAgentService.validateSession();

    await BlueskyAgentService.retryOperation(async () => {
      const response = await agent.deletePost(uri);
      // The deletePost operation is successful even if it returns no data
      return response;
    }, 'delete post');
  }
}