
import { useCallback } from 'react';
import { CameraConstraints } from '@/utils/cameraConstraints';
import { CameraError, createPlaybackError } from '@/utils/cameraErrorHandler';

interface UseCameraInitializationProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  setStream: (stream: MediaStream | null) => void;
  setErrorState: (error: CameraError) => void;
}

/**
 * Hook for camera initialization logic
 */
export function useCameraInitialization({
  videoRef,
  setStream,
  setErrorState
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
  }, [videoRef, setStream, setErrorState]);

  return {
    requestCamera,
    initializeVideoStream
  };
}
