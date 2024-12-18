import { ApiError } from '../errors/ApiError';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
}

export class RetryService {
  private static readonly DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000,
  };

  static async retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    let lastError: Error | null = null;
    let delay = config.initialDelay;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (this.shouldRetry(error, attempt, config.maxAttempts)) {
          await this.delay(delay);
          delay = Math.min(delay * 2, config.maxDelay);
          continue;
        }
        
        throw lastError;
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  private static shouldRetry(error: unknown, attempt: number, maxAttempts: number): boolean {
    if (attempt >= maxAttempts) return false;
    
    if (error instanceof ApiError) {
      // Don't retry auth errors
      if (error.status === 401) return false;
      // Don't retry not found errors
      if (error.status === 404) return false;
      // Always retry rate limit errors
      if (error.status === 429) return true;
      // Retry server errors
      if (error.status >= 500) return true;
    }
    
    return true;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}