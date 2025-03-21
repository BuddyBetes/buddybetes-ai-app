
import React, { useEffect } from 'react';
import { useCamera } from '@/hooks/use-camera';
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
  const { toast } = useToast();
  
  const {
    videoRef,
    canvasRef,
    isInitializing,
    error,
    flashEffect,
    permissionDenied,
    initCamera,
    captureImage,
    retryAttempts,
    isRetrying
  } = useCamera({
    enabled: !capturedImage,
    maxRetryAttempts: 3
  });

  // Log when component mounts and unmounts for debugging
  useEffect(() => {
    console.log('CameraCapture component mounted');
    
    return () => {
      console.log('CameraCapture component unmounted, cleaning up resources');
    };
  }, []);

  const handleCaptureImage = () => {
    const imageDataUrl = captureImage();
    if (imageDataUrl) {
      onCapture(imageDataUrl);
    } else {
      toast({
        title: "Capture failed",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      });
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
        onCaptureImage={handleCaptureImage}
        videoRef={videoRef}
        canvasRef={canvasRef}
        isInitializing={isInitializing}
        error={error}
        flashEffect={flashEffect}
        permissionDenied={permissionDenied}
        onRetryCamera={initCamera}
        retryAttempts={retryAttempts}
        isRetrying={isRetrying}
      />
      
      {/* Controls */}
      <div className="p-6 bg-black flex justify-center">
        <CaptureButton 
          onCapture={handleCaptureImage} 
          disabled={isInitializing || !!error} 
        />
      </div>
      
      {/* Instructions */}
      <CaptureInstructions mode={mode} />
    </div>
  );
};

export default CameraCapture;
