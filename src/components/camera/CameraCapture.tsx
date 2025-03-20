
import React, { useRef, useState, useEffect } from 'react';
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

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const constraints = {
          video: { 
            facingMode: 'environment', 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
          }
        };
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
        
        setIsInitializing(false);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please check permissions.');
        setIsInitializing(false);
      }
    };

    if (!capturedImage) {
      initCamera();
    }

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg');
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
