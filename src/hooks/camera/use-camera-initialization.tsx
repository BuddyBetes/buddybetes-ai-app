
import { useCallback } from 'react';
import { CameraConstraints } from '@/utils/cameraConstraints';
import { CameraError, createPlaybackError } from '@/utils/cameraErrorHandler';

interface UseCameraInitializationProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  setStream: (stream: MediaStream | null) => void;
  setErrorState: (error: CameraError) => void;
  setVideoElementReady?: (ready: boolean) => void;
}

/**
 * Hook for camera initialization logic
 */
export function useCameraInitialization({
  videoRef,
  setStream,
  setErrorState,
  setVideoElementReady
}: UseCameraInitializationProps) {
  
  /**
   * Request camera access with specified constraints
   */
  const requestCamera = async (constraints: CameraConstraints): Promise<MediaStream> => {
    try {
      // Check for MediaDevices API support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser');
      }
      
      console.log('Requesting camera with constraints:', JSON.stringify(constraints));
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.error("Error requesting camera:", err);
      throw err;
    }
  };

  /**
   * Initialize video stream with the provided MediaStream
   */
  const initializeVideoStream = useCallback((mediaStream: MediaStream) => {
    console.log('Camera access granted successfully');
    
    if (!videoRef.current) {
      console.error('Video reference is null');
      const initError = {
        type: 'initialization' as const,
        message: 'Camera initialization failed. Please reload the page and try again.',
        isPermissionIssue: false,
        suggestedAction: 'Reload the page and try again.',
        isRetryable: true,
        retryDelay: 2000,
        technicalDetails: 'Video element reference is null'
      };
      setErrorState(initError);
      return;
    }
    
    console.log('Setting video source and applying properties');
    
    // Notify that we've found the video element (if callback provided)
    if (setVideoElementReady) {
      setVideoElementReady(true);
    }
    
    try {
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
    } catch (err) {
      console.error('Error setting up video element:', err);
      const setupError = {
        type: 'initialization' as const,
        message: 'Failed to initialize camera stream. Please try again.',
        isPermissionIssue: false,
        suggestedAction: 'Try reloading the page.',
        isRetryable: true,
        retryDelay: 2000,
        technicalDetails: err instanceof Error ? err.message : String(err)
      };
      setErrorState(setupError);
    }
  }, [videoRef, setStream, setErrorState, setVideoElementReady]);

  return {
    requestCamera,
    initializeVideoStream
  };
}
