
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera } from 'lucide-react';
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
  permissionDenied = false
}) => {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
      {isInitializing ? (
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Initializing camera...</p>
        </div>
      ) : error ? (
        <div className="text-white text-center p-6">
          <div className="bg-red-900/50 p-4 rounded-lg mb-4">
            <p className="text-red-300 font-semibold mb-2">Camera Error</p>
            <p className="text-white/80">{error}</p>
          </div>
          
          {permissionDenied && (
            <div className="mt-4">
              <p className="text-white/80 mb-4">
                You need to allow camera access in your browser settings to use this feature.
              </p>
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
            className="absolute inset-0 w-full h-full object-cover"
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
