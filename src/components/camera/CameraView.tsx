
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
}

const CameraView: React.FC<CameraViewProps> = ({ 
  mode, 
  onClose, 
  onCaptureImage,
  videoRef,
  canvasRef,
  isInitializing,
  error,
  flashEffect
}) => {
  return (
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
          <CaptureOverlay mode={mode} />
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
  );
};

export default CameraView;
