import { BskyAgent } from '@atproto/api';
import { ApiError } from '../errors/ApiError';
import { RetryService } from '../utils/retryService';

export class BlueskyAgentService {
  private static instance: BskyAgent | null = null;

  static getInstance(): BskyAgent {
    if (!this.instance) {
      throw new ApiError('No Bluesky agent instance available');
    }
    return this.instance;
  }

  static setInstance(agent: BskyAgent | null): void {
    this.instance = agent;
  }

  static validateSession(): void {
    if (!this.instance?.session) {
      throw new ApiError('Not authenticated', 401);
    }
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await RetryService.retry(operation);
    } catch (error) {
      console.error(`Error in ${operationName}:`, error);
      throw error instanceof Error
        ? new ApiError(error.message)
        : new ApiError(`Failed to ${operationName}`);
    }
  }

  static async getLikedPosts(params: { actor: string; limit: number }) {
    if (!this.instance) {
      throw new ApiError('No Bluesky agent instance available');
    }
    return await this.instance.getActorLikes(params);
  }

  static async unlikePost(uri: string) {
    if (!this.instance) {
      throw new ApiError('No Bluesky agent instance available');
    }
    return await this.instance.deleteLike(uri);
  }
}