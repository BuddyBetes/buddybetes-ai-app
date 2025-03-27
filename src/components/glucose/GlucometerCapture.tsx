
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Check, Edit3, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processGlucometerImage } from '@/utils/glucometerProcessing';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface GlucometerCaptureProps {
  onCapture: (reading: number) => void;
  onClose: () => void;
}

const GlucometerCapture: React.FC<GlucometerCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  const [manualReading, setManualReading] = useState<string>('');
  const { toast } = useToast();

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
        setProcessingError(null); // Clear any previous errors
      }
    }
  };

  const confirmImage = async () => {
    if (capturedImage) {
      setIsProcessing(true);
      setProcessingError(null);
      
      try {
        // Process the image to extract the glucometer reading
        const reading = await processGlucometerImage(capturedImage);
        
        if (reading && !isNaN(reading)) {
          console.log('Extracted glucometer reading:', reading);
          onCapture(reading);
        } else {
          // No reading detected - set error and stay on the current screen
          setProcessingError('No glucose reading detected. Please try again with a clearer photo or enter manually.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error processing glucometer image:', error);
        setProcessingError(error instanceof Error ? error.message : 'Processing error');
        setIsProcessing(false);
      }
    }
  };
  
  const handleManualEntry = () => {
    setManualEntryMode(true);
    setProcessingError(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const submitManualReading = () => {
    const reading = parseInt(manualReading, 10);
    if (!isNaN(reading) && reading > 0) {
      onCapture(reading);
    } else {
      toast({
        title: "Invalid Reading",
        description: "Please enter a valid number.",
        variant: "destructive"
      });
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    setIsCapturing(true);
    setManualEntryMode(false);
    setProcessingError(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>
    );
  }

  if (manualEntryMode) {
    return (
      <div className="flex flex-col items-center space-y-4 p-4">
        <h2 className="text-lg font-medium text-center">
          Enter Glucose Reading
        </h2>
        <p className="text-sm text-gray-500 text-center -mt-2 mb-2">
          Please enter your reading manually
        </p>
        
        <Input
          type="number"
          value={manualReading}
          onChange={(e) => setManualReading(e.target.value)}
          placeholder="Enter reading (mg/dL)"
          className="w-full max-w-xs text-center text-xl"
        />
        
        <div className="flex justify-center space-x-4 w-full mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitManualReading} 
            className="bg-buddy-500 hover:bg-buddy-600"
          >
            Submit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-2">
      <h2 className="text-lg font-medium text-center mb-2">
        Scan Your Glucometer
      </h2>
      <p className="text-sm text-gray-500 text-center -mt-2 mb-2">
        Align the display in the center of your camera
      </p>
      
      {processingError && (
        <Alert variant="destructive" className="mx-2 mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{processingError}</AlertDescription>
        </Alert>
      )}
      
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
            alt="Captured glucometer" 
            className="w-full aspect-[3/4] object-cover" 
          />
        )}
        
        {/* Overlay guide for glucometer positioning */}
        {isCapturing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-buddy-500 rounded-lg w-4/5 h-1/4 opacity-50"></div>
          </div>
        )}
        
        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center items-center space-x-4 w-full">
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
            <Button
              variant="outline"
              size="icon"
              onClick={handleManualEntry}
              className="rounded-full"
              title="Enter reading manually"
            >
              <Edit3 className="h-6 w-6" />
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={retakeImage}
              className="rounded-full"
              disabled={isProcessing}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button 
              onClick={confirmImage} 
              size="icon"
              className="bg-buddy-500 hover:bg-buddy-600 rounded-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleManualEntry}
              className="rounded-full"
              disabled={isProcessing}
              title="Enter reading manually"
            >
              <Edit3 className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default GlucometerCapture;
