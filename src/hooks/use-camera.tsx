
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

  // Monitor when the video element becomes available
  useEffect(() => {
    const checkVideoRef = () => {
      if (videoRef.current) {
        setVideoElementReady(true);
      }
    };

    // Check immediately
    checkVideoRef();

    // Set up MutationObserver to detect when video element is added to DOM
    if (!videoElementReady && typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(checkVideoRef);
      observer.observe(document.body, { childList: true, subtree: true });
      
      return () => {
        observer.disconnect();
      };
    }
  }, [videoElementReady]);

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
        
        // Delay the video stream initialization slightly to ensure DOM is ready
        setTimeout(() => {
          if (videoRef.current) {
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
          } else {
            console.error("Video reference still null after delay");
            const videoMissingError = {
              type: 'initialization' as const,
              message: 'Camera UI not ready. Please try again.',
              isPermissionIssue: false,
              suggestedAction: 'Close and reopen the camera.',
              isRetryable: true,
              retryDelay: 2000,
              technicalDetails: 'Video element reference is null'
            };
            setErrorState(videoMissingError);
          }
        }, 300); // Increased delay to ensure DOM is ready
      } catch (err: any) {
        if (retryAttempts === 0 && !isRetrying && constraintsToUse === constraints.optimal) {
          console.log('Optimal constraints failed, trying fallback:', err);
          try {
            console.log('Attempting fallback constraints...');
            const fallbackStream = await requestCamera(constraints.fallback);
            
            // Delay initialization to ensure DOM is ready
            setTimeout(() => {
              if (videoRef.current) {
                initializeVideoStream(fallbackStream);
              } else {
                console.error("Video reference null during fallback initialization");
                throw new Error("Video element not available");
              }
            }, 300); // Increased delay for fallback
            return;
          } catch (fallbackErr) {
            console.error('Fallback camera access also failed:', fallbackErr);
            try {
              console.log('Attempting minimal constraints...');
              const minimalStream = await requestCamera(constraints.minimal);
              
              // Delay initialization to ensure DOM is ready
              setTimeout(() => {
                if (videoRef.current) {
                  initializeVideoStream(minimalStream);
                } else {
                  console.error("Video reference null during minimal initialization");
                  throw new Error("Video element not available");
                }
              }, 300); // Increased delay for minimal
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
    toast,
    videoRef
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
    
    // Properly return the Promise from initCamera
    return initCamera();
  }, [initCamera, cleanupRetryTimeout, resetErrorState]);

  // Effect to initialize camera when enabled, with improved lifecycle management
  useEffect(() => {
    let isActive = true; // Flag to track if this effect is still active
    let checkInterval: number | null = null;
    let timeoutTimer: number | null = null;
    
    if (enabled) {
      console.log('Camera is enabled, initializing...');
      
      // Add a slight delay before initialization to ensure everything is ready
      timeoutTimer = window.setTimeout(() => {
        if (!isActive) return; // Check if component is still mounted
        
        // Check if the video element is available before trying to initialize
        if (videoRef.current) {
          console.log('Video element is ready, proceeding with initialization');
          initCamera();
        } else {
          console.log('Video element not ready yet, waiting...');
          // Set up a polling mechanism to check for video element
          checkInterval = window.setInterval(() => {
            if (!isActive) {
              // Clean up if component unmounted
              if (checkInterval !== null) {
                clearInterval(checkInterval);
                checkInterval = null;
              }
              return;
            }
            
            if (videoRef.current) {
              console.log('Video element now available, initializing camera');
              if (checkInterval !== null) {
                clearInterval(checkInterval);
                checkInterval = null;
              }
              initCamera();
            }
          }, 100);
          
          // Clean up interval after a reasonable timeout
          timeoutTimer = window.setTimeout(() => {
            if (!isActive) return;
            
            if (checkInterval !== null) {
              clearInterval(checkInterval);
              checkInterval = null;
            }
            
            if (!videoRef.current) {
              console.error('Video element still not available after timeout');
              const timeoutError = {
                type: 'initialization' as const,
                message: 'Camera could not initialize. Please try again.',
                isPermissionIssue: false,
                suggestedAction: 'Close and reopen the camera.',
                isRetryable: true,
                retryDelay: 1000,
                technicalDetails: 'Video element reference timeout'
              };
              setErrorState(timeoutError);
            }
          }, 5000);
        }
      }, 300);
      
      return () => {
        // Mark effect as inactive to prevent state updates after unmount
        isActive = false;
        
        // Clear all timers and intervals
        if (timeoutTimer !== null) {
          clearTimeout(timeoutTimer);
          timeoutTimer = null;
        }
        
        if (checkInterval !== null) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
        
        // Clean up resources
        cleanupStream();
        cleanupRetryTimeout();
        
        // Reset initialization lock on unmount
        initializationLock.current = false;
      };
    }

    return () => {
      // Mark effect as inactive
      isActive = false;
      
      // Clean up resources
      cleanupStream();
      cleanupRetryTimeout();
      
      // Clear timers
      if (timeoutTimer !== null) {
        clearTimeout(timeoutTimer);
      }
      
      if (checkInterval !== null) {
        clearInterval(checkInterval);
      }
      
      // Reset initialization lock
      initializationLock.current = false;
    };
  }, [enabled, isMobile, initCamera, cleanupStream, cleanupRetryTimeout, setErrorState]);

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
