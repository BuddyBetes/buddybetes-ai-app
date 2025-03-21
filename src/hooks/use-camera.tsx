
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from './use-mobile';
import { useToast } from './use-toast';
import { useCameraConstraints, CameraConstraints } from '@/utils/cameraConstraints';

interface UseCameraProps {
  enabled: boolean;
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
}

export function useCamera({ enabled }: UseCameraProps): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const constraints = useCameraConstraints();

  // Initialize camera
  const initCamera = async () => {
    try {
      console.log('Starting camera initialization...');
      setIsInitializing(true);
      setError(null);
      setPermissionDenied(false);
      
      if (stream) {
        // Clean up existing stream first
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped existing camera track');
        });
        setStream(null);
      }
      
      console.log('Requesting camera with constraints:', JSON.stringify(constraints.optimal));
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser');
      }
      
      try {
        // Try with optimal constraints first
        const mediaStream = await requestCamera(constraints.optimal);
        initializeVideoStream(mediaStream);
      } catch (err: any) {
        // If optimal constraints fail, try fallback
        console.log('Optimal constraints failed, trying fallback:', err);
        if (err instanceof DOMException && err.name === 'OverconstrainedError') {
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
        }
        throw err;
      }
    } catch (err: any) {
      handleCameraError(err);
    } finally {
      setIsInitializing(false);
    }
  };

  // Helper function to request camera access
  const requestCamera = async (constraints: CameraConstraints): Promise<MediaStream> => {
    return await navigator.mediaDevices.getUserMedia(constraints);
  };
  
  // Helper function to initialize video stream
  const initializeVideoStream = (mediaStream: MediaStream) => {
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
            setError('Could not play camera feed. Please try again or check browser settings.');
          });
        }
      };
      
      setStream(mediaStream);
    } else {
      console.error('Video reference is null');
      setError('Camera initialization failed. Please reload the page and try again.');
    }
  };
  
  // Helper function to handle camera errors
  const handleCameraError = (err: any) => {
    console.error('Error accessing camera:', err);
    
    if (err instanceof DOMException && 
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
      setPermissionDenied(true);
      setError('Camera access denied. Please allow camera access in your browser settings.');
      toast({
        title: "Camera access denied",
        description: "Please allow camera access in your browser settings.",
        variant: "destructive",
      });
    } else if (err instanceof DOMException && err.name === 'NotReadableError') {
      setError('Camera is already in use by another application or tab. Please close other apps using your camera.');
    } else if (err instanceof DOMException && err.name === 'OverconstrainedError') {
      setError('Your device does not support the requested camera resolution or facing mode. Please try again with different settings.');
    } else {
      setError(`Could not access camera. ${err.message || 'Please try again with a different browser.'}`);
      toast({
        title: "Camera error",
        description: "Could not access camera. Try reloading the page or using a different browser.",
        variant: "destructive",
      });
    }
  };

  const captureImage = (): string | null => {
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
        toast({
          title: "Capture failed",
          description: "Failed to capture image. Please try again.",
          variant: "destructive",
        });
      }
    }
    return null;
  };

  // Initialize camera on mount if enabled
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
    };
  }, [enabled, isMobile]);

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
    initCamera
  };
}
