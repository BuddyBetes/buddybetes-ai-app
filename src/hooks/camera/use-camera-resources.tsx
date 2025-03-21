
import { useState, useRef } from 'react';
import { useToast } from '../use-toast';

/**
 * Hook to manage camera stream resources
 */
export function useCameraResources() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);
  const retryTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  // Track if cleanup is in progress to prevent multiple overlapping cleanups
  const cleanupInProgress = useRef<boolean>(false);

  // Clean up camera stream with improved handling
  const cleanupStream = () => {
    // Prevent multiple overlapping cleanups
    if (cleanupInProgress.current) {
      console.log('Cleanup already in progress, skipping duplicate call');
      return;
    }
    
    cleanupInProgress.current = true;
    
    if (stream) {
      try {
        const tracks = stream.getTracks();
        if (tracks.length > 0) {
          tracks.forEach(track => {
            if (track.readyState === 'live') {
              track.stop();
              console.log('Camera track stopped');
            } else {
              console.log(`Track already stopped or ended, state: ${track.readyState}`);
            }
          });
        } else {
          console.log('No tracks found in stream to stop');
        }
      } catch (err) {
        console.error('Error stopping camera tracks:', err);
      }
    }
    
    // Reset cleanup flag after short delay
    setTimeout(() => {
      cleanupInProgress.current = false;
    }, 100);
  };

  // Clean up retry timeout
  const cleanupRetryTimeout = () => {
    if (retryTimeoutRef.current !== null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  return {
    stream,
    setStream,
    flashEffect,
    setFlashEffect,
    retryTimeoutRef,
    cleanupStream,
    cleanupRetryTimeout,
    toast
  };
}
