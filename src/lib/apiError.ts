import { PostgrestError } from '@supabase/supabase-js';

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromSupabaseError(error: PostgrestError | unknown): ApiError {
    if (!error) {
      return new ApiError('UNKNOWN_ERROR', 'An unknown error occurred');
    }

    if (typeof error === 'object' && 'message' in error && 'code' in error) {
      const pgError = error as PostgrestError;
      return new ApiError(pgError.code || 'DB_ERROR', pgError.message, undefined, error);
    }

    if (error instanceof Error) {
      return new ApiError('NETWORK_ERROR', error.message, undefined, error);
    }

    return new ApiError('UNKNOWN_ERROR', String(error), undefined, error);
  }

  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'ECONNREFUSED';
  }

  isNotFoundError(): boolean {
    return this.statusCode === 404 || this.code === 'PGRST116';
  }

  isAuthError(): boolean {
    return this.code.includes('auth') || this.statusCode === 401;
  }

  isForbiddenError(): boolean {
    return this.statusCode === 403;
  }

  getUserMessage(): string {
    if (this.isNetworkError()) {
      return 'Network error. Please check your connection.';
    }
    if (this.isNotFoundError()) {
      return 'Resource not found.';
    }
    if (this.isAuthError()) {
      return 'Authentication failed. Please log in again.';
    }
    if (this.isForbiddenError()) {
      return 'You do not have permission to access this resource.';
    }
    return this.message || 'An error occurred. Please try again.';
  }
}
