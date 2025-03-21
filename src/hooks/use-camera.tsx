
import { useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from './use-mobile';
import { useCameraConstraints } from '@/utils/cameraConstraints';
import { parseCameraError } from '@/utils/cameraErrorHandler';
import { useCameraResources } from './camera/use-camera-resources';
import { useCameraInitialization } from './camera/use-camera-initialization';
import { useCameraErrorState } from './camera/use-camera-error-state';
import { useCameraCapture } from './camera/use-camera-capture';

interface UseCameraProps {
  enabled: boolean;
  maxRetryAttempts?: number;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  stream: MediaStream | null;
  isInitializing: boolean;
  error: string | null;
  permissionDenied: boolean;
  flashEffect: boolean;
  setFlashEffect: (show: boolean) => void;
  captureImage: () => string | null;
  initCamera: () => Promise<void>;
  retryAttempts: number;
  isRetrying: boolean;
}

export function useCamera({ enabled, maxRetryAttempts = 3 }: UseCameraProps): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const isMobile = useIsMobile();
  const constraints = useCameraConstraints();
  
  // Use the refactored hooks
  const {
    stream, 
    setStream,
    flashEffect,
    setFlashEffect,
    retryTimeoutRef,
    cleanupStream,
    cleanupRetryTimeout,
    toast
  } = useCameraResources();

  // We need to create a forward declaration of initCamera since it's used in the error state hook
  const initCameraRef = useRef<(errorTypeHint?: string) => Promise<void>>(async () => {});
  
  const {
    error,
    permissionDenied,
    retryAttempts,
    isRetrying,
    setErrorState,
    resetErrorState,
    setIsRetrying,
    setPermissionDenied
  } = useCameraErrorState({
    maxRetryAttempts,
    retryTimeoutRef,
    toast,
    initCamera: (errorTypeHint?: string) => initCameraRef.current(errorTypeHint)
  });

  const { 
    requestCamera, 
    initializeVideoStream 
  } = useCameraInitialization({
    videoRef,
    setStream,
    setErrorState
  });

  const { captureImage } = useCameraCapture({
    videoRef,
    canvasRef,
    setFlashEffect,
    setErrorState
  });

  // Definition of initCamera
  const initCamera = useCallback(async (errorTypeHint?: string) => {
    try {
      console.log(`Starting camera initialization... ${errorTypeHint ? `After ${errorTypeHint} error` : ''} (Attempt ${retryAttempts + 1})`);
      setIsInitializing(true);
      setError(null);
      
      if (retryAttempts === 0 || !isRetrying) {
        setPermissionDenied(false);
      }
      
      // Stop any existing streams before requesting a new one
      cleanupStream();
      setStream(null);
      
      let constraintsToUse = constraints.optimal;
      
      if (errorTypeHint === 'overconstrained' || retryAttempts === 1) {
        console.log('Using fallback constraints due to previous error or retry attempt');
        constraintsToUse = constraints.fallback;
      } else if (retryAttempts >= 2) {
        console.log('Using minimal constraints for higher retry attempt');
        constraintsToUse = constraints.minimal;
      }
      
      console.log('Requesting camera with constraints:', JSON.stringify(constraintsToUse));
      
      try {
        const mediaStream = await requestCamera(constraintsToUse);
        initializeVideoStream(mediaStream);
        
        if (retryAttempts > 0) {
          toast({
            title: "Camera connected",
            description: "Camera connection restored successfully",
            duration: 3000,
          });
          
          setTimeout(() => {
            resetErrorState();
          }, 500);
        }
      } catch (err: any) {
        if (retryAttempts === 0 && !isRetrying && constraintsToUse === constraints.optimal) {
          console.log('Optimal constraints failed, trying fallback:', err);
          try {
            console.log('Attempting fallback constraints...');
            const fallbackStream = await requestCamera(constraints.fallback);
            initializeVideoStream(fallbackStream);
            return;
          } catch (fallbackErr) {
            console.error('Fallback camera access also failed:', fallbackErr);
            try {
              console.log('Attempting minimal constraints...');
              const minimalStream = await requestCamera(constraints.minimal);
              initializeVideoStream(minimalStream);
              return;
            } catch (minimalErr) {
              console.error('All constraint options failed:', minimalErr);
              throw err; // Throw the original error
            }
          }
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      const cameraError = parseCameraError(err);
      console.error(`Camera initialization failed with error type: ${cameraError.type}`, cameraError);
      setErrorState(cameraError);
    } finally {
      setIsInitializing(false);
    }
  }, [
    retryAttempts, 
    isRetrying, 
    constraints, 
    initializeVideoStream,
    requestCamera,
    cleanupStream,
    setStream,
    setErrorState,
    resetErrorState,
    setPermissionDenied,
    toast
  ]);

  // Store the current initCamera in the ref
  initCameraRef.current = initCamera;

  // Function for manual retry
  const manualRetry = useCallback(async () => {
    console.log('Manual camera retry initiated');
    
    cleanupRetryTimeout();
    resetErrorState();
    
    // Properly return the Promise from initCamera
    return initCamera();
  }, [initCamera, cleanupRetryTimeout, resetErrorState]);

  // Effect to initialize camera when enabled
  useEffect(() => {
    if (enabled) {
      console.log('Camera is enabled, initializing...');
      const timer = setTimeout(() => {
        initCamera();
      }, 300);
      
      return () => clearTimeout(timer);
    }

    return () => {
      cleanupStream();
      cleanupRetryTimeout();
    };
  }, [enabled, isMobile, initCamera, cleanupStream, cleanupRetryTimeout]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupStream();
      cleanupRetryTimeout();
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    stream,
    isInitializing,
    error,
    permissionDenied,
    flashEffect,
    setFlashEffect,
    captureImage,
    initCamera: manualRetry,
    retryAttempts,
    isRetrying
  };
}

// Import useState at the top of the file
import { useState } from 'react';
