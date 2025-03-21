
/**
 * Camera error handling utilities
 */
import { toast } from "@/hooks/use-toast";

// Camera error types
export type CameraErrorType = 
  | 'permission_denied'
  | 'device_in_use'
  | 'overconstrained'
  | 'no_camera'
  | 'initialization'
  | 'playback'
  | 'capture'
  | 'https_required'
  | 'insecure_context'
  | 'unknown';

// Camera error details
export interface CameraError {
  type: CameraErrorType;
  message: string;
  technicalDetails?: string;
  isPermissionIssue: boolean;
  suggestedAction?: string;
  isRetryable?: boolean;
  retryDelay?: number;
}

/**
 * Parses and categorizes camera errors
 * @param err The error object from camera initialization
 * @returns Structured camera error object
 */
export function parseCameraError(err: any): CameraError {
  console.error('Camera error:', err);
  
  // Check for secure context
  if (window.isSecureContext === false) {
    return {
      type: 'insecure_context',
      message: 'Camera requires a secure context (HTTPS). Please load this site using HTTPS.',
      technicalDetails: 'Security error: window.isSecureContext is false',
      isPermissionIssue: false,
      suggestedAction: 'Load the site using HTTPS.',
      isRetryable: false
    };
  }
  
  // Handle DOM exceptions
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return {
          type: 'permission_denied',
          message: 'Camera access denied. Please allow camera access in your browser settings.',
          technicalDetails: `${err.name}: ${err.message}`,
          isPermissionIssue: true,
          suggestedAction: 'Check browser permissions and try again.',
          isRetryable: false
        };
        
      case 'NotReadableError':
        return {
          type: 'device_in_use',
          message: 'Camera is already in use by another application or tab.',
          technicalDetails: `${err.name}: ${err.message}`,
          isPermissionIssue: false,
          suggestedAction: 'Close other apps using your camera and try again.',
          isRetryable: true,
          retryDelay: 3000 // Retry after 3 seconds
        };
        
      case 'OverconstrainedError':
        return {
          type: 'overconstrained',
          message: 'Your device does not support the requested camera resolution or facing mode.',
          technicalDetails: `${err.name}: ${err.message}`,
          isPermissionIssue: false,
          suggestedAction: 'Try again with different settings.',
          isRetryable: true,
          retryDelay: 1000 // Retry quickly with fallback constraints
        };
        
      case 'NotFoundError':
        return {
          type: 'no_camera',
          message: 'No camera detected on your device, or camera access is disabled.',
          technicalDetails: `${err.name}: ${err.message}`,
          isPermissionIssue: false,
          suggestedAction: 'Check if your device has a camera and it is enabled.',
          isRetryable: true,
          retryDelay: 2000 // Retry after 2 seconds
        };
        
      case 'AbortError':
        return {
          type: 'device_in_use',
          message: 'Camera access was aborted. This may be because the camera is already in use.',
          technicalDetails: `${err.name}: ${err.message}`,
          isPermissionIssue: false,
          suggestedAction: 'Close other applications using your camera and try again.',
          isRetryable: true,
          retryDelay: 3000
        };
        
      case 'SecurityError':
        return {
          type: 'https_required',
          message: 'Camera access requires a secure connection (HTTPS).',
          technicalDetails: `${err.name}: ${err.message}`,
          isPermissionIssue: false,
          suggestedAction: 'Use the application on a secure connection (HTTPS).',
          isRetryable: false
        };
        
      case 'TypeError':
        // This can happen if constraints are invalid
        return {
          type: 'initialization',
          message: 'Invalid camera settings. Please try again with different settings.',
          technicalDetails: `${err.name}: ${err.message}`,
          isPermissionIssue: false,
          suggestedAction: 'Reload the page and try again with default settings.',
          isRetryable: true,
          retryDelay: 1000
        };
    }
  }
  
  // Handle other types of errors
  if (err?.message?.includes('getUserMedia is not implemented')) {
    return {
      type: 'no_camera',
      message: 'Your browser does not support camera access.',
      technicalDetails: err.message,
      isPermissionIssue: false,
      suggestedAction: 'Try using a modern browser like Chrome, Firefox, or Safari.',
      isRetryable: false
    };
  }
  
  // Check for https specifically
  if (err?.message?.includes('secure origin') || (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost')) {
    return {
      type: 'https_required',
      message: 'Camera access requires HTTPS. Please use a secure connection.',
      technicalDetails: err?.message || 'Non-secure context detected',
      isPermissionIssue: false,
      suggestedAction: 'Load the application using HTTPS instead of HTTP.',
      isRetryable: false
    };
  }
  
  // Default error
  return {
    type: 'unknown',
    message: 'An unexpected error occurred while accessing the camera.',
    technicalDetails: err?.message || 'Unknown error',
    isPermissionIssue: false,
    suggestedAction: 'Try reloading the page or using a different browser.',
    isRetryable: true,
    retryDelay: 2000 // Retry after 2 seconds
  };
}

/**
 * Handles camera error by showing appropriate toast messages
 * @param error Structured camera error object
 */
export function handleCameraError(error: CameraError): void {
  // Show toast notification based on error type
  toast({
    title: getCameraErrorTitle(error.type),
    description: error.message,
    variant: "destructive",
  });
  
  // Log detailed error information for debugging
  console.error(`Camera Error (${error.type}):`, {
    message: error.message,
    details: error.technicalDetails,
    isPermissionIssue: error.isPermissionIssue,
    suggestedAction: error.suggestedAction,
    isRetryable: error.isRetryable,
    retryDelay: error.retryDelay
  });
}

/**
 * Get appropriate title for toast notification based on error type
 */
function getCameraErrorTitle(errorType: CameraErrorType): string {
  switch (errorType) {
    case 'permission_denied':
      return 'Camera access denied';
    case 'device_in_use':
      return 'Camera in use';
    case 'overconstrained':
      return 'Camera settings issue';
    case 'no_camera':
      return 'Camera not available';
    case 'initialization':
      return 'Camera initialization failed';
    case 'playback':
      return 'Camera playback error';
    case 'capture':
      return 'Image capture failed';
    case 'https_required':
    case 'insecure_context':
      return 'Secure connection required';
    default:
      return 'Camera error';
  }
}

/**
 * Create capture error
 * @param message Error message
 * @returns Structured camera error for capture issues
 */
export function createCaptureError(message: string): CameraError {
  return {
    type: 'capture',
    message: message || 'Failed to capture image. Please try again.',
    isPermissionIssue: false,
    suggestedAction: 'Try again or reload the page.',
    isRetryable: true,
    retryDelay: 1000
  };
}

/**
 * Create playback error
 * @param message Error message
 * @returns Structured camera error for playback issues
 */
export function createPlaybackError(message: string): CameraError {
  return {
    type: 'playback',
    message: message || 'Could not play camera feed. Please try again or check browser settings.',
    isPermissionIssue: false,
    suggestedAction: 'Check that your browser allows autoplay or reload the page.',
    isRetryable: true,
    retryDelay: 2000
  };
}

/**
 * Determine if an error should trigger an automatic retry
 * @param error The camera error object
 * @returns True if the error is retryable
 */
export function isRetryableError(error: CameraError): boolean {
  // Don't retry permission errors - user interaction required
  if (error.isPermissionIssue) {
    return false;
  }
  
  return error.isRetryable === true;
}

/**
 * Get appropriate retry delay for an error
 * @param error The camera error object
 * @param attemptNumber The current retry attempt number (1-based)
 * @returns Delay in milliseconds before next retry
 */
export function getRetryDelay(error: CameraError, attemptNumber: number): number {
  // Base delay from error definition or default to 2000ms
  const baseDelay = error.retryDelay || 2000;
  
  // Use exponential backoff with a maximum of 10 seconds
  const exponentialDelay = Math.min(
    baseDelay * Math.pow(1.5, attemptNumber - 1), 
    10000
  );
  
  // Add some jitter (±20%)
  const jitter = 0.8 + (Math.random() * 0.4);
  
  return Math.floor(exponentialDelay * jitter);
}

/**
 * Create a notification message for camera retry attempts
 * @param attemptNumber Current retry attempt number
 * @param maxAttempts Maximum number of retry attempts
 * @param errorType Type of error being retried
 * @returns Message string for user notification
 */
export function createRetryMessage(
  attemptNumber: number, 
  maxAttempts: number, 
  errorType: CameraErrorType
): string {
  return `Retrying camera ${attemptNumber}/${maxAttempts} after ${errorType.replace('_', ' ')} error`;
}
