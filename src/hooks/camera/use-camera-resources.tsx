
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

  // Clean up camera stream
  const cleanupStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
    }
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
