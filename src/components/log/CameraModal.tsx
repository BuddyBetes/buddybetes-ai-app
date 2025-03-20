
import React, { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import CameraCapture from '@/components/camera/CameraCapture';
import ProcessingService from './ProcessingService';

interface CameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanMode: 'food' | 'meter';
}

const CameraModal: React.FC<CameraModalProps> = ({ 
  open, 
  onOpenChange,
  scanMode
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);

  const handleCapture = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
  };

  const handleCloseCamera = () => {
    setCapturedImage(null);
    setProcessingImage(false);
    onOpenChange(false);
  };

  const handleProcessingComplete = () => {
    // Close modal and reset state
    onOpenChange(false);
    setTimeout(() => setCapturedImage(null), 500);
  };

  return (
    <Sheet open={open} onOpenChange={handleCloseCamera}>
      <SheetContent side="bottom" className="h-[100dvh] p-0">
        <CameraCapture 
          mode={scanMode} 
          onCapture={handleCapture} 
          onClose={handleCloseCamera}
          isProcessing={processingImage}
          capturedImage={capturedImage}
        />
        
        <ProcessingService
          scanMode={scanMode}
          capturedImage={capturedImage}
          setProcessingImage={setProcessingImage}
          onProcessingComplete={handleProcessingComplete}
        />
      </SheetContent>
    </Sheet>
  );
};

export default CameraModal;
