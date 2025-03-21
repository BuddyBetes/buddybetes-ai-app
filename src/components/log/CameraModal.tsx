
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import CameraCapture from '@/components/camera/CameraCapture';
import ProcessingService from './ProcessingService';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  // Reset state when modal is opened
  useEffect(() => {
    if (open) {
      setCapturedImage(null);
      setProcessingImage(false);
    }
  }, [open]);

  const handleCapture = (imageDataUrl: string) => {
    console.log('Image captured, proceeding to processing');
    setCapturedImage(imageDataUrl);
    
    toast({
      title: scanMode === 'food' ? "Food captured" : "Meter captured",
      description: "Processing image...",
      duration: 3000,
    });
  };

  const handleCloseCamera = () => {
    // If we're processing, confirm before closing
    if (processingImage) {
      const shouldClose = window.confirm("Processing in progress. Are you sure you want to close?");
      if (!shouldClose) return;
    }
    
    setCapturedImage(null);
    setProcessingImage(false);
    onOpenChange(false);
  };

  const handleProcessingComplete = () => {
    console.log('Processing complete, closing modal');
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
