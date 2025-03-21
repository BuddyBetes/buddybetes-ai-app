
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
  | 'unknown';

// Camera error details
export interface CameraError {
  type: CameraErrorType;
  message: string;
  technicalDetails?: string;
  isPermissionIssue: boolean;
  suggestedAction?: string;
}

/**
 * Parses and categorizes camera errors
 * @param err The error object from camera initialization
 * @returns Structured camera error object
 */
export function parseCameraError(err: any): CameraError {
  console.error('Camera error:', err);
  
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
          suggestedAction: 'Check browser permissions and try again.'
        };
        
      case 'NotReadableError':
        return {
          type: 'device_in_use',
          message: 'Camera is already in use by another application or tab.',
          technicalDetails: `${err.name}: ${err.message}`,
          isPermissionIssue: false,
          suggestedAction: 'Close other apps using your camera and try again.'
        };
        
      case 'OverconstrainedError':
        return {
          type: 'overconstrained',
          message: 'Your device does not support the requested camera resolution or facing mode.',
          technicalDetails: `${err.name}: ${err.message}`,
          isPermissionIssue: false,
          suggestedAction: 'Try again with different settings.'
        };
        
      case 'NotFoundError':
        return {
          type: 'no_camera',
          message: 'No camera detected on your device, or camera access is disabled.',
          technicalDetails: `${err.name}: ${err.message}`,
          isPermissionIssue: false,
          suggestedAction: 'Check if your device has a camera and it is enabled.'
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
      suggestedAction: 'Try using a modern browser like Chrome, Firefox, or Safari.'
    };
  }
  
  // Default error
  return {
    type: 'unknown',
    message: 'An unexpected error occurred while accessing the camera.',
    technicalDetails: err?.message || 'Unknown error',
    isPermissionIssue: false,
    suggestedAction: 'Try reloading the page or using a different browser.'
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
    suggestedAction: error.suggestedAction
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
    suggestedAction: 'Try again or reload the page.'
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
    suggestedAction: 'Check that your browser allows autoplay or reload the page.'
  };
}
