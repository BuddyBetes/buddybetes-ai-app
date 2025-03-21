
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
  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsInitializing(true);
        
        // Request camera permission with appropriate constraints for mobile
        const constraints = {
          video: { 
            facingMode: 'environment', 
            width: { ideal: isMobile ? 1280 : 1920 }, 
            height: { ideal: isMobile ? 720 : 1080 }
          },
          audio: false
        };
        
        console.log('Requesting camera access with constraints:', constraints);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Camera access granted');
        
        if (videoRef.current) {
          console.log('Setting video source object');
          videoRef.current.srcObject = mediaStream;
          
          // Ensure video plays after metadata is loaded
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, playing video');
            if (videoRef.current) {
              videoRef.current.play().catch(e => {
                console.error('Error playing video:', e);
                setError('Could not play camera feed. Please check your browser settings.');
              });
            }
          };
          
          setStream(mediaStream);
        }
        
        setIsInitializing(false);
      } catch (err) {
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
        } else {
          setError('Could not access camera. Please check if another app is using your camera or try a different browser.');
          toast({
            title: "Camera error",
            description: "Could not access camera. Try reloading the page or using a different browser.",
            variant: "destructive",
          });
        }
        
        setIsInitializing(false);
      }
    };

    if (!capturedImage) {
      initCamera();
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
  }, [capturedImage, isMobile, toast]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
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
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data URL with improved quality
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      console.log('Image captured successfully');
      onCapture(imageDataUrl);
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
