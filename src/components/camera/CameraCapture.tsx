
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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

  // Dynamic overlay based on scanning mode
  const renderOverlay = () => {
    if (mode === 'food') {
      return (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-[70%] h-[70%] border-2 border-white rounded-xl"></div>
          </div>
          <div className="absolute bottom-24 left-0 right-0 text-center text-white bg-black/30 py-2">
            Center the food item in the frame
          </div>
        </div>
      );
    } else {
      return (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-[80%] h-[30%] border-2 border-white rounded-lg">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-[90%] border-t-2 border-white"></div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-24 left-0 right-0 text-center text-white bg-black/30 py-2">
            Align glucose reading with the line
          </div>
        </div>
      );
    }
  };

  // Render captured image
  if (capturedImage) {
    return (
      <div className="flex flex-col h-full bg-black">
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-contain"
          />
          
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                <p>Processing image...</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white bg-black/30 hover:bg-black/50"
            onClick={onClose}
            disabled={isProcessing}
          >
            <X />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Camera view */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {isInitializing ? (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Initializing camera...</p>
          </div>
        ) : error ? (
          <div className="text-white text-center p-4">
            <p className="text-red-400 mb-2">Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {renderOverlay()}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Flash effect */}
            {flashEffect && (
              <div className="absolute inset-0 bg-white animate-flash"></div>
            )}
          </>
        )}
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white bg-black/30 hover:bg-black/50"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      
      {/* Controls */}
      <div className="p-6 bg-black flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-white w-16 h-16 rounded-full flex items-center justify-center"
          onClick={captureImage}
          disabled={isInitializing || !!error}
        >
          <div className="bg-white w-14 h-14 rounded-full border-2 border-black"></div>
        </motion.button>
      </div>
      
      {/* Instructions */}
      <div className="p-4 bg-black text-white text-center">
        <p className="font-medium mb-1">
          {mode === 'food' ? 'Food Scanner' : 'Glucose Meter Scanner'}
        </p>
        <p className="text-sm text-gray-300">
          {mode === 'food' ? 
            'Position your food item in the center of the frame' : 
            'Align your glucose meter display with the horizontal line'
          }
        </p>
      </div>
    </div>
  );
};

export default CameraCapture;
