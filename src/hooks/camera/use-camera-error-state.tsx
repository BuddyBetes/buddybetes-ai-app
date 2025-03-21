
import { useState, useCallback } from 'react';
import { CameraError, isRetryableError, getRetryDelay, createRetryMessage } from '@/utils/cameraErrorHandler';

interface UseCameraErrorStateProps {
  maxRetryAttempts: number;
  retryTimeoutRef: React.MutableRefObject<number | null>;
  toast: any;
  initCamera: (errorTypeHint?: string) => Promise<void>;
}

/**
 * Hook for managing camera error states and retries
 */
export function useCameraErrorState({
  maxRetryAttempts,
  retryTimeoutRef,
  toast,
  initCamera
}: UseCameraErrorStateProps) {
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<CameraError | null>(null);

  /**
   * Handle camera errors and set up retries if applicable
   */
  const setErrorState = useCallback((cameraError: CameraError) => {
    setError(cameraError.message);
    setLastError(cameraError);
    
    if (cameraError.isPermissionIssue) {
      setPermissionDenied(true);
    }
    
    if (isRetryableError(cameraError) && retryAttempts < maxRetryAttempts) {
      const nextAttempt = retryAttempts + 1;
      const retryDelay = getRetryDelay(cameraError, nextAttempt);
      
      console.log(`Setting up automatic retry #${nextAttempt} in ${retryDelay}ms for error: ${cameraError.type}`);
      
      if (nextAttempt > 1) {
        toast({
          title: "Camera reconnection",
          description: createRetryMessage(nextAttempt, maxRetryAttempts, cameraError.type),
          duration: 3000,
        });
      }
      
      setIsRetrying(true);
      
      retryTimeoutRef.current = window.setTimeout(() => {
        setRetryAttempts(nextAttempt);
        initCamera(cameraError.type);
      }, retryDelay);
    } else {
      setIsRetrying(false);
    }
  }, [retryAttempts, maxRetryAttempts, toast, initCamera, retryTimeoutRef]);

  /**
   * Reset error state
   */
  const resetErrorState = useCallback(() => {
    setRetryAttempts(0);
    setIsRetrying(false);
    setLastError(null);
    setError(null);
    setPermissionDenied(false);
  }, []);

  return {
    error,
    setError,
    permissionDenied,
    setPermissionDenied,
    retryAttempts,
    setRetryAttempts,
    isRetrying,
    setIsRetrying,
    lastError,
    setErrorState,
    resetErrorState
  };
}
