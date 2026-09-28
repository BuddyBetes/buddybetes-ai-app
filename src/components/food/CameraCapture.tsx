import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Check } from 'lucide-react';
import { getMedia } from '@/utils/mediaPermissions';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize camera when modal content mounts on user action
  useEffect(() => {
    let isCancelled = false;

    const startCamera = async () => {
      try {
        const constraints = {
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        console.log('Requesting camera with constraints:', constraints);
        const mediaStream = await getMedia('camera', constraints);
        
        if (isCancelled) {
          if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
          }
          return;
        }

        // If user denied or device missing, getMedia notifies and returns null -> close modal
        if (!mediaStream) {
          onClose();
          return;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          console.log('Camera started successfully');
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please ensure camera permissions are granted.');
        onClose();
      }
    };

    startCamera();

    // Clean up: stop all active camera tracks
    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [onClose]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        console.log(`Capturing image at resolution: ${canvas.width}x${canvas.height}`);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        console.log('Image captured, data URL length:', imageData.length);
        
        setCapturedImage(imageData);
        setIsCapturing(false);
      }
    }
  };

  const confirmImage = () => {
    if (capturedImage) {
      console.log('Confirming image, data URL length:', capturedImage.length);
      onCapture(capturedImage);
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    setIsCapturing(true);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-2">
      <div className="relative w-full max-w-md rounded-lg overflow-hidden bg-black">
        {isCapturing ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-[3/4] object-cover"
          />
        ) : (
          <img 
            src={capturedImage || ''} 
            alt="Captured food" 
            className="w-full aspect-[3/4] object-cover" 
          />
        )}
        
        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center space-x-4 w-full">
        {isCapturing ? (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
            <Button 
              onClick={captureImage} 
              size="icon"
              className="bg-buddy-500 hover:bg-buddy-600 rounded-full h-16 w-16"
            >
              <Camera className="h-8 w-8" />
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={retakeImage}
              className="rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
            <Button 
              onClick={confirmImage} 
              size="icon"
              className="bg-buddy-500 hover:bg-buddy-600 rounded-full"
            >
              <Check className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
