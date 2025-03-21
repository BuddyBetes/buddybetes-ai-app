
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
   * Enhanced with more reliable video element handling
   */
  const initializeVideoStream = useCallback((mediaStream: MediaStream) => {
    console.log('Camera access granted successfully');
    
    // Set stream first to ensure it's available
    setStream(mediaStream);
    
    // Use a small delay to ensure DOM has time to render
    setTimeout(() => {
      if (!videoRef.current) {
        console.error('Video reference is null after delay');
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
        // Apply video element attributes
        const videoElement = videoRef.current;
        videoElement.setAttribute('autoplay', 'true');
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('muted', 'true');
        
        // Set srcObject and muted state
        videoElement.srcObject = mediaStream;
        videoElement.muted = true;
        
        // Handle video metadata loading
        const onMetadataLoaded = () => {
          console.log('Video metadata loaded, playing video...');
          
          if (videoRef.current) {
            videoRef.current.play()
              .catch(e => {
                console.error('Error playing video:', e);
                const playbackError = createPlaybackError('Could not play camera feed. Please try again or check browser settings.');
                setErrorState(playbackError);
              });
          }
        };
        
        // Remove any existing event listener to prevent duplicates
        videoElement.removeEventListener('loadedmetadata', onMetadataLoaded);
        
        // Add event listener for metadata loading
        videoElement.addEventListener('loadedmetadata', onMetadataLoaded);
        
        // If video already has metadata, trigger play immediately
        if (videoElement.readyState >= 2) {
          console.log('Video already has metadata, playing directly');
          onMetadataLoaded();
        }
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
    }, 500); // Increased delay to 500ms to give more time for DOM rendering
  }, [videoRef, setStream, setErrorState, setVideoElementReady]);

  return {
    requestCamera,
    initializeVideoStream
  };
}
