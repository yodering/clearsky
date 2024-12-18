export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Ensure proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  static fromError(error: Error, status: number = 500): ApiError {
    return new ApiError(error.message, status);
  }
}