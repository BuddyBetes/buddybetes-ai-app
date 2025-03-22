
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize camera
  useEffect(() => {
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
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          console.log('Camera started successfully');
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setError('Could not access camera. Please ensure camera permissions are granted.');
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        console.log(`Capturing image at resolution: ${canvas.width}x${canvas.height}`);
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL with high quality
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
