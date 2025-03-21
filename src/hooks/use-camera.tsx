
import { useEffect, useRef, useCallback, useState } from 'react';
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
  const [videoElementReady, setVideoElementReady] = useState(false);
  const isMobile = useIsMobile();
  const constraints = useCameraConstraints();
  
  // Added initialization lock to prevent multiple simultaneous init attempts
  const initializationLock = useRef<boolean>(false);
  
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
    setPermissionDenied,
    setError
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
    setErrorState,
    setVideoElementReady
  });

  const { captureImage } = useCameraCapture({
    videoRef,
    canvasRef,
    setFlashEffect,
    setErrorState
  });

  // Modified video element ready detection
  useEffect(() => {
    // Flag to track if component is mounted
    let isMounted = true;
    let checkIntervalId: number | null = null;
    
    const checkVideoRef = () => {
      if (!isMounted) return;
      
      if (videoRef.current) {
        console.log('Video element is now available in the DOM');
        setVideoElementReady(true);
        
        if (checkIntervalId !== null) {
          clearInterval(checkIntervalId);
          checkIntervalId = null;
        }
      }
    };

    // Check immediately
    checkVideoRef();
    
    // If video element isn't ready yet, set up a polling interval
    if (!videoElementReady && enabled) {
      console.log('Setting up polling for video element availability');
      checkIntervalId = window.setInterval(checkVideoRef, 100);
      
      // Clear interval after a reasonable timeout (10 seconds)
      setTimeout(() => {
        if (!isMounted) return;
        
        if (checkIntervalId !== null) {
          clearInterval(checkIntervalId);
          checkIntervalId = null;
        }
        
        if (!videoElementReady) {
          console.log('Video element polling timed out');
        }
      }, 10000);
    }
    
    return () => {
      isMounted = false;
      if (checkIntervalId !== null) {
        clearInterval(checkIntervalId);
      }
    };
  }, [videoElementReady, enabled]);

  // Definition of initCamera with lock mechanism
  const initCamera = useCallback(async (errorTypeHint?: string) => {
    // Prevent multiple simultaneous initialization attempts
    if (initializationLock.current) {
      console.log('Camera initialization already in progress, skipping');
      return;
    }
    
    try {
      // Set initialization lock
      initializationLock.current = true;
      
      console.log(`Starting camera initialization... ${errorTypeHint ? `After ${errorTypeHint} error` : ''} (Attempt ${retryAttempts + 1})`);
      setIsInitializing(true);
      
      if (setError) {
        setError(null);
      }
      
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
        
        // Initialize video stream with the obtained media stream
        // The initializeVideoStream function now has its own delay
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
      // Release initialization lock with a short delay to prevent rapid successive calls
      setTimeout(() => {
        initializationLock.current = false;
      }, 500);
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
    setError,
    toast
  ]);

  // Store the current initCamera in the ref
  initCameraRef.current = initCamera;

  // Function for manual retry with debounce
  const manualRetry = useCallback(async () => {
    // Prevent retry if initialization is already in progress
    if (initializationLock.current) {
      console.log('Manual camera retry skipped - initialization already in progress');
      return;
    }
    
    console.log('Manual camera retry initiated');
    
    cleanupRetryTimeout();
    resetErrorState();
    
    // Return the Promise from initCamera
    return initCamera();
  }, [initCamera, cleanupRetryTimeout, resetErrorState]);

  // Effect to initialize camera when enabled, with improved lifecycle management
  useEffect(() => {
    // Skip initialization if component is not enabled
    if (!enabled) return;

    let isActive = true; // Flag to track if effect is still active
    let timeoutTimer: number | null = null;
    
    console.log('Camera is enabled, initializing...');
    
    // Add a longer delay before initialization to ensure DOM is ready
    timeoutTimer = window.setTimeout(() => {
      if (!isActive) return; // Check if component is still mounted
      
      // Check if we have detected a video element is ready
      if (videoElementReady) {
        console.log('Video element is ready, proceeding with initialization');
        initCamera();
      } else {
        console.log('Video element not ready yet, waiting for ready state...');
        // We'll rely on the videoElementReady state change to trigger initialization
        
        // Set a longer timeout as a fallback if the ready state never triggers
        timeoutTimer = window.setTimeout(() => {
          if (!isActive) return;
          
          if (!videoElementReady) {
            console.log('Forcing camera initialization after timeout');
            initCamera();
          }
        }, 2000); // Wait 2 seconds before forcing initialization
      }
    }, 800); // Increased initial delay to 800ms
    
    return () => {
      // Mark effect as inactive
      isActive = false;
      
      // Clean up resources
      if (timeoutTimer !== null) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
      
      cleanupStream();
      cleanupRetryTimeout();
      
      // Reset initialization lock
      initializationLock.current = false;
    };
  }, [enabled, videoElementReady, initCamera, cleanupStream, cleanupRetryTimeout]);

  // Effect to initialize camera when videoElementReady changes to true
  useEffect(() => {
    if (!enabled || !videoElementReady || initializationLock.current) return;
    
    console.log('Video element is ready, initializing camera...');
    
    // Small delay to ensure React rendering cycle is complete
    const timer = setTimeout(() => {
      initCamera();
    }, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [videoElementReady, enabled, initCamera]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupStream();
      cleanupRetryTimeout();
      initializationLock.current = false;
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
