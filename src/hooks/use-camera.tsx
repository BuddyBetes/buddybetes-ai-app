
import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from './use-mobile';
import { useToast } from './use-toast';
import { useCameraConstraints, CameraConstraints } from '@/utils/cameraConstraints';
import { 
  CameraError, 
  parseCameraError, 
  handleCameraError, 
  createCaptureError, 
  createPlaybackError,
  isRetryableError,
  getRetryDelay,
  createRetryMessage
} from '@/utils/cameraErrorHandler';

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
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<CameraError | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const constraints = useCameraConstraints();

  // Clean up retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to set error state from a camera error
  const setErrorState = useCallback((cameraError: CameraError) => {
    setError(cameraError.message);
    setLastError(cameraError);
    
    if (cameraError.isPermissionIssue) {
      setPermissionDenied(true);
    }
    
    handleCameraError(cameraError);
    
    // Set up automatic retry if applicable
    if (isRetryableError(cameraError) && retryAttempts < maxRetryAttempts) {
      const nextAttempt = retryAttempts + 1;
      const retryDelay = getRetryDelay(cameraError, nextAttempt);
      
      console.log(`Setting up automatic retry #${nextAttempt} in ${retryDelay}ms for error: ${cameraError.type}`);
      
      // Notify user about retry
      if (nextAttempt > 1) { // Don't show for first retry to avoid too many toasts
        toast({
          title: "Camera reconnection",
          description: createRetryMessage(nextAttempt, maxRetryAttempts, cameraError.type),
          duration: 3000,
        });
      }
      
      setIsRetrying(true);
      
      // Schedule retry
      retryTimeoutRef.current = window.setTimeout(() => {
        setRetryAttempts(nextAttempt);
        initCamera(cameraError.type);
      }, retryDelay);
    } else {
      setIsRetrying(false);
    }
  }, [retryAttempts, maxRetryAttempts, toast]);

  // Helper function to request camera access
  const requestCamera = async (constraints: CameraConstraints): Promise<MediaStream> => {
    return await navigator.mediaDevices.getUserMedia(constraints);
  };
  
  // Helper function to initialize video stream
  const initializeVideoStream = useCallback((mediaStream: MediaStream) => {
    console.log('Camera access granted successfully');
    
    if (videoRef.current) {
      console.log('Setting video source and applying properties');
      
      // Important for iOS Safari
      videoRef.current.setAttribute('autoplay', 'true');
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('muted', 'true');
      
      videoRef.current.srcObject = mediaStream;
      videoRef.current.muted = true;
      
      // Ensure video plays after metadata is loaded
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded, playing video...');
        if (videoRef.current) {
          videoRef.current.play().catch(e => {
            console.error('Error playing video:', e);
            const playbackError = createPlaybackError('Could not play camera feed. Please try again or check browser settings.');
            setErrorState(playbackError);
          });
        }
      };
      
      setStream(mediaStream);
    } else {
      console.error('Video reference is null');
      const initError = {
        type: 'initialization' as const,
        message: 'Camera initialization failed. Please reload the page and try again.',
        isPermissionIssue: false,
        suggestedAction: 'Reload the page and try again.',
        isRetryable: true,
        retryDelay: 2000
      };
      setErrorState(initError);
    }
  }, [setErrorState]);

  // Initialize camera with optional error type hint
  const initCamera = useCallback(async (errorTypeHint?: string) => {
    try {
      console.log(`Starting camera initialization... ${errorTypeHint ? `After ${errorTypeHint} error` : ''} (Attempt ${retryAttempts + 1})`);
      setIsInitializing(true);
      setError(null);
      
      // Only reset permission denial on first attempt or explicit user retry
      if (retryAttempts === 0 || !isRetrying) {
        setPermissionDenied(false);
      }
      
      if (stream) {
        // Clean up existing stream first
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped existing camera track');
        });
        setStream(null);
      }
      
      // Determine which constraints to use based on error type and retry attempt
      let constraintsToUse = constraints.optimal;
      
      if (errorTypeHint === 'overconstrained' || retryAttempts === 1) {
        console.log('Using fallback constraints due to previous error or retry attempt');
        constraintsToUse = constraints.fallback;
      } else if (retryAttempts >= 2) {
        console.log('Using minimal constraints for higher retry attempt');
        constraintsToUse = constraints.minimal;
      }
      
      console.log('Requesting camera with constraints:', JSON.stringify(constraintsToUse));
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser');
      }
      
      try {
        // Try with selected constraints
        const mediaStream = await requestCamera(constraintsToUse);
        initializeVideoStream(mediaStream);
        
        // Reset retry count on success
        if (retryAttempts > 0) {
          toast({
            title: "Camera connected",
            description: "Camera connection restored successfully",
            duration: 3000,
          });
          
          // Reset retry state after short delay to avoid UI flicker
          setTimeout(() => {
            setRetryAttempts(0);
            setIsRetrying(false);
            setLastError(null);
          }, 500);
        }
      } catch (err: any) {
        // For first attempt, try fallback constraints
        if (retryAttempts === 0 && !isRetrying && constraintsToUse === constraints.optimal) {
          console.log('Optimal constraints failed, trying fallback:', err);
          try {
            const fallbackStream = await requestCamera(constraints.fallback);
            initializeVideoStream(fallbackStream);
            return;
          } catch (fallbackErr) {
            console.error('Fallback camera access also failed:', fallbackErr);
            // If fallback fails, try minimal constraints
            try {
              const minimalStream = await requestCamera(constraints.minimal);
              initializeVideoStream(minimalStream);
              return;
            } catch (minimalErr) {
              // If all attempts fail, throw the original error
              throw err;
            }
          }
        } else {
          // If already retrying or using non-optimal constraints, propagate error
          throw err;
        }
      }
    } catch (err: any) {
      const cameraError = parseCameraError(err);
      setErrorState(cameraError);
    } finally {
      setIsInitializing(false);
    }
  }, [
    retryAttempts, 
    isRetrying, 
    stream, 
    constraints, 
    initializeVideoStream, 
    setErrorState,
    toast
  ]);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Cannot capture: Video or canvas ref is null');
      return null;
    }
    
    // Play shutter sound
    const audio = new Audio('/message-sent.mp3');
    audio.volume = 0.2;
    audio.play().catch(e => console.log('Audio play error:', e));
    
    // Add flash effect
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 150);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data URL with improved quality
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        console.log('Image captured successfully');
        return imageDataUrl;
      } catch (err) {
        console.error('Error capturing image:', err);
        const captureError = createCaptureError('Failed to capture image. Please try again.');
        setErrorState(captureError);
      }
    }
    return null;
  }, [setErrorState]);

  // Initialize camera on mount if enabled or when retry count changes
  useEffect(() => {
    if (enabled) {
      console.log('Camera is enabled, initializing...');
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        initCamera();
      }, 300);
      
      return () => clearTimeout(timer);
    }

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Camera track stopped');
        });
      }
      
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [enabled, isMobile, initCamera, stream, retryAttempts]);

  // Manual retry handler - completely resets the camera
  const manualRetry = useCallback(() => {
    console.log('Manual camera retry initiated');
    
    // Clear any pending automatic retries
    if (retryTimeoutRef.current !== null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    // Reset retry state
    setRetryAttempts(0);
    setIsRetrying(false);
    setLastError(null);
    
    // Re-initialize camera
    initCamera();
  }, [initCamera]);

  // Override initCamera with manualRetry to ensure proper reset
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
