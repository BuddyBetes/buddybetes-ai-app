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

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const setErrorState = useCallback((cameraError: CameraError) => {
    setError(cameraError.message);
    setLastError(cameraError);
    
    if (cameraError.isPermissionIssue) {
      setPermissionDenied(true);
    }
    
    handleCameraError(cameraError);
    
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
  }, [retryAttempts, maxRetryAttempts, toast]);

  const requestCamera = async (constraints: CameraConstraints): Promise<MediaStream> => {
    return await navigator.mediaDevices.getUserMedia(constraints);
  };

  const initializeVideoStream = useCallback((mediaStream: MediaStream) => {
    console.log('Camera access granted successfully');
    
    if (videoRef.current) {
      console.log('Setting video source and applying properties');
      
      videoRef.current.setAttribute('autoplay', 'true');
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('muted', 'true');
      
      videoRef.current.srcObject = mediaStream;
      videoRef.current.muted = true;
      
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

  const initCamera = useCallback(async (errorTypeHint?: string) => {
    try {
      console.log(`Starting camera initialization... ${errorTypeHint ? `After ${errorTypeHint} error` : ''} (Attempt ${retryAttempts + 1})`);
      setIsInitializing(true);
      setError(null);
      
      if (retryAttempts === 0 || !isRetrying) {
        setPermissionDenied(false);
      }
      
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped existing camera track');
        });
        setStream(null);
      }
      
      let constraintsToUse = constraints.optimal;
      
      if (errorTypeHint === 'overconstrained' || retryAttempts === 1) {
        console.log('Using fallback constraints due to previous error or retry attempt');
        constraintsToUse = constraints.fallback;
      } else if (retryAttempts >= 2) {
        console.log('Using minimal constraints for higher retry attempt');
        constraintsToUse = constraints.minimal;
      }
      
      console.log('Requesting camera with constraints:', JSON.stringify(constraintsToUse));
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser');
      }
      
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
            setRetryAttempts(0);
            setIsRetrying(false);
            setLastError(null);
          }, 500);
        }
      } catch (err: any) {
        if (retryAttempts === 0 && !isRetrying && constraintsToUse === constraints.optimal) {
          console.log('Optimal constraints failed, trying fallback:', err);
          try {
            const fallbackStream = await requestCamera(constraints.fallback);
            initializeVideoStream(fallbackStream);
            return;
          } catch (fallbackErr) {
            console.error('Fallback camera access also failed:', fallbackErr);
            try {
              const minimalStream = await requestCamera(constraints.minimal);
              initializeVideoStream(minimalStream);
              return;
            } catch (minimalErr) {
              throw err;
            }
          }
        } else {
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
    
    const audio = new Audio('/message-sent.mp3');
    audio.volume = 0.2;
    audio.play().catch(e => console.log('Audio play error:', e));
    
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 150);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const context = canvas.getContext('2d');
    if (context) {
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
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

  useEffect(() => {
    if (enabled) {
      console.log('Camera is enabled, initializing...');
      const timer = setTimeout(() => {
        initCamera();
      }, 300);
      
      return () => clearTimeout(timer);
    }

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

  const manualRetry = useCallback(async () => {
    console.log('Manual camera retry initiated');
    
    if (retryTimeoutRef.current !== null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setRetryAttempts(0);
    setIsRetrying(false);
    setLastError(null);
    
    await initCamera();
  }, [initCamera]);

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
