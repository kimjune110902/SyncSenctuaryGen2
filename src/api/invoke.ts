export interface ApiError {
  type: string;
  message?: string;
  locked_until?: string;
  retry_after_seconds?: number;
  reason?: string;
  minimum_version?: string;
  download_url?: string;
  status?: number;
}

export function mapApiErrorToMessage(apiError: ApiError): string {
  switch (apiError.type) {
    case 'InvalidCredentials':
      return 'Incorrect phone number/email or password.';
    case 'AccountLocked':
      return `Account temporarily locked. Try again in ${Math.ceil((apiError.retry_after_seconds || 0) / 60)} minutes.`;
    case 'AccountSuspended':
      return 'This account has been suspended. Contact support.';
    case 'AccountDeleted':
      return 'This account no longer exists.';
    case 'NoPasswordSet':
      return "This account uses Google sign-in. Click 'Continue with Google'.";
    case 'RateLimited':
      return `Too many login attempts. Please wait ${apiError.retry_after_seconds} seconds.`;
    case 'Network':
      return 'Could not connect to SyncSanctuary servers. Check your internet connection.';
    case 'Timeout':
      return 'The connection timed out. Check your internet connection.';
    case 'ServerError':
      return apiError.message || 'Something went wrong on our end. Please try again.';
    case 'TokenTheftDetected':
      return 'Security alert: all sessions terminated. Please log in again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
