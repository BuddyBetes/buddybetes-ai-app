
import { useCallback } from 'react';
import { CameraError, createCaptureError } from '@/utils/cameraErrorHandler';

interface UseCameraCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setFlashEffect: (show: boolean) => void;
  setErrorState: (error: CameraError) => void;
}

/**
 * Hook for camera capture functionality
 */
export function useCameraCapture({
  videoRef,
  canvasRef,
  setFlashEffect,
  setErrorState
}: UseCameraCaptureProps) {
  
  /**
   * Capture an image from the camera feed
   */
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
    
    // Set canvas dimensions to match video feed
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
  }, [videoRef, canvasRef, setFlashEffect, setErrorState]);

  return { captureImage };
}
