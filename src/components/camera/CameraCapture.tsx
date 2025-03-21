
import React, { useRef, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import CaptureButton from './CaptureButton';
import CaptureInstructions from './CaptureInstructions';
import CameraView from './CameraView';
import CapturedImageView from './CapturedImageView';

interface CameraCaptureProps {
  mode: 'food' | 'meter';
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
  capturedImage?: string | null;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  mode, 
  onCapture, 
  onClose,
  isProcessing = false,
  capturedImage = null
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

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
      
      // Set constraints based on device
      const facingMode = isMobile ? { exact: 'environment' } : 'user';
      
      // For mobile devices, we'll try lower resolution first for compatibility
      const mobileConstraints = {
        audio: false,
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      };
      
      // For desktop devices, we can use higher resolution
      const desktopConstraints = {
        audio: false,
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const constraints = isMobile ? mobileConstraints : desktopConstraints;
      
      console.log('Requesting camera with constraints:', JSON.stringify(constraints));
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser');
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
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
      
      setIsInitializing(false);
    } catch (err: any) {
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
        // If 'exact: environment' fails, try without 'exact' constraint
        if (isMobile && JSON.stringify(constraints).includes('exact')) {
          console.log('Retrying with less strict constraints...');
          const fallbackConstraints = {
            audio: false,
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };
          
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
              videoRef.current.play().catch(e => console.error('Fallback play error:', e));
              setStream(fallbackStream);
              setIsInitializing(false);
              return;
            }
          } catch (fallbackErr) {
            console.error('Fallback camera access also failed:', fallbackErr);
          }
        }
        
        setError('Your device does not support the requested camera resolution or facing mode. Please try again with different settings.');
      } else {
        setError(`Could not access camera. ${err.message || 'Please try again with a different browser.'}`);
        toast({
          title: "Camera error",
          description: "Could not access camera. Try reloading the page or using a different browser.",
          variant: "destructive",
        });
      }
      
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!capturedImage) {
      console.log('Initializing camera on component mount');
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
  }, [capturedImage, isMobile]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Cannot capture: Video or canvas ref is null');
      return;
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
        onCapture(imageDataUrl);
      } catch (err) {
        console.error('Error capturing image:', err);
        toast({
          title: "Capture failed",
          description: "Failed to capture image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Render captured image
  if (capturedImage) {
    return (
      <CapturedImageView 
        imageUrl={capturedImage} 
        onClose={onClose} 
        isProcessing={isProcessing} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Camera view */}
      <CameraView 
        mode={mode}
        onClose={onClose}
        onCaptureImage={captureImage}
        videoRef={videoRef}
        canvasRef={canvasRef}
        isInitializing={isInitializing}
        error={error}
        flashEffect={flashEffect}
        permissionDenied={permissionDenied}
        isMobile={isMobile}
        onRetryCamera={initCamera}
      />
      
      {/* Controls */}
      <div className="p-6 bg-black flex justify-center">
        <CaptureButton 
          onCapture={captureImage} 
          disabled={isInitializing || !!error} 
        />
      </div>
      
      {/* Instructions */}
      <CaptureInstructions mode={mode} />
    </div>
  );
};

export default CameraCapture;
