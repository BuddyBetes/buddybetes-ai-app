import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, RefreshCw, Smartphone } from 'lucide-react';
import CaptureOverlay from './CaptureOverlay';

interface CameraViewProps {
  mode: 'food' | 'meter';
  onClose: () => void;
  onCaptureImage: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isInitializing: boolean;
  error: string | null;
  flashEffect: boolean;
  permissionDenied?: boolean;
  isMobile?: boolean;
  onRetryCamera: () => void;
  retryAttempts?: number;
  isRetrying?: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ 
  mode, 
  onClose, 
  onCaptureImage,
  videoRef,
  canvasRef,
  isInitializing,
  error,
  flashEffect,
  permissionDenied = false,
  isMobile = false,
  onRetryCamera,
  retryAttempts = 0,
  isRetrying = false
}) => {
  const [manualRetryAttempts, setManualRetryAttempts] = useState(0);
  const [isRetryingManually, setIsRetryingManually] = useState(false);
  const mountedRef = useRef(false);

  // Function to refresh the page
  const handleRefresh = () => {
    window.location.reload();
  };

  // Function to retry camera connection
  const handleRetryCamera = async () => {
    setManualRetryAttempts(prev => prev + 1);
    setIsRetryingManually(true);
    
    try {
      console.log('Attempting manual camera retry...');
      await onRetryCamera();
      console.log('Manual camera retry completed');
    } catch (err) {
      console.error('Manual camera retry failed:', err);
    } finally {
      setIsRetryingManually(false);
    }
  };

  // Reset retry state if error is cleared
  useEffect(() => {
    if (!error) {
      setManualRetryAttempts(0);
    }
  }, [error]);

  // Mark component as mounted
  useEffect(() => {
    console.log('CameraView component mounted');
    mountedRef.current = true;
    
    return () => {
      console.log('CameraView component unmounted');
      mountedRef.current = false;
    };
  }, []);

  // Function for iOS-specific camera help
  const showIOSHelp = () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (!isIOS) return null;
    
    return (
      <div className="mt-4 p-3 bg-yellow-900/50 rounded-lg text-left">
        <p className="text-yellow-300 font-semibold mb-1">iOS Safari Tips:</p>
        <ul className="text-white/80 text-sm list-disc pl-4 space-y-1">
          <li>Make sure camera access is enabled in Settings &gt; Safari &gt; Camera</li>
          <li>Try using the main Safari browser (not in-app browsers)</li>
          <li>Ensure iOS is updated to the latest version</li>
        </ul>
      </div>
    );
  };

  const showAndroidHelp = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (!isAndroid) return null;
    
    return (
      <div className="mt-4 p-3 bg-yellow-900/50 rounded-lg text-left">
        <p className="text-yellow-300 font-semibold mb-1">Android Tips:</p>
        <ul className="text-white/80 text-sm list-disc pl-4 space-y-1">
          <li>Make sure camera permissions are granted in your browser settings</li>
          <li>Try using Chrome or Firefox for better compatibility</li>
          <li>Check that no other apps are using the camera</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
      {isInitializing ? (
        <div className="text-white text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="mb-3">Initializing camera...</p>
          <p className="text-sm text-white/70">
            {isRetrying ? `Automatic retry in progress (${retryAttempts}/3)...` : 'Please allow camera access when prompted'}
          </p>
        </div>
      ) : error ? (
        <div className="text-white text-center p-6">
          <div className="bg-red-900/50 p-4 rounded-lg mb-4">
            <p className="text-red-300 font-semibold mb-2">Camera Error</p>
            <p className="text-white/80">{error}</p>
            
            {isRetrying && (
              <div className="mt-3 bg-blue-900/30 p-2 rounded">
                <p className="text-blue-300 text-sm">
                  Automatic recovery in progress ({retryAttempts}/3)
                </p>
              </div>
            )}
          </div>
          
          {permissionDenied ? (
            <div className="mt-4">
              <p className="text-white/80 mb-4">
                You need to allow camera access in your browser settings to use this feature.
              </p>
              
              {showIOSHelp()}
              {showAndroidHelp()}
              
              <div className="flex justify-center space-x-3 mt-4">
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/30"
                  onClick={handleRetryCamera}
                  disabled={isRetryingManually}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isRetryingManually ? 'Trying...' : 'Try Again'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/30"
                  onClick={onClose}
                >
                  Close Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center space-y-4">
              <Button 
                variant="outline" 
                className="bg-white/10 text-white border-white/30"
                onClick={handleRetryCamera}
                disabled={isRetrying || isRetryingManually}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying || isRetryingManually ? 'animate-spin' : ''}`} />
                {isRetrying || isRetryingManually ? 'Retrying...' : 'Retry Camera'}
              </Button>
              
              {(manualRetryAttempts >= 2 || retryAttempts >= 2) && (
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/30"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>
              )}
              
              {showIOSHelp()}
              {showAndroidHelp()}
              
              <Button 
                variant="outline" 
                className="bg-white/10 text-white border-white/30"
                onClick={onClose}
              >
                Close Camera
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full ${isMobile ? 'object-cover' : 'object-contain'}`}
            style={{ 
              transform: 'scaleX(1)',
              WebkitTransform: 'scaleX(1)'
            }}
          />
          <CaptureOverlay mode={mode} />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Flash effect */}
          {flashEffect && (
            <div className="absolute inset-0 bg-white opacity-70 z-10"></div>
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
  );
};

export default CameraView;
