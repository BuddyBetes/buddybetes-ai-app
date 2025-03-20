
import React, { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import CameraCapture from '@/components/camera/CameraCapture';
import { useToast } from '@/hooks/use-toast';
import { useLogContext } from '@/context/LogContext';

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
  const { toast } = useToast();
  const { addLog } = useLogContext();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);

  const handleCapture = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setProcessingImage(true);
    
    // Show processing toast
    if (scanMode === 'food') {
      toast({
        title: "Food scan complete",
        description: "Processing food image...",
      });
      
      // Simulate food recognition (in a real app, this would call an API)
      setTimeout(() => {
        setProcessingImage(false);
        
        toast({
          title: "Food recognized",
          description: "Detected: Apple (15g carbs). Adding to your log entry.",
        });
        
        // Close modal and reset state
        onOpenChange(false);
        setTimeout(() => setCapturedImage(null), 500);
      }, 1500);
    } else {
      toast({
        title: "Meter scan complete",
        description: "Processing glucose reading...",
      });
      
      // Simulate OCR for glucose reading (in a real app, this would call an API)
      setTimeout(() => {
        setProcessingImage(false);
        
        // Detected glucose value
        const glucoseValue = 118;
        
        toast({
          title: "Reading detected",
          description: `Glucose reading: ${glucoseValue} mg/dL. Adding to your log entry.`,
        });
        
        // Add the glucose reading to logs
        addLog({
          timestamp: new Date(),
          glucoseLevel: glucoseValue,
          mealContext: 'fasting',
        });
        
        // Close modal and reset state
        onOpenChange(false);
        setTimeout(() => setCapturedImage(null), 500);
      }, 1500);
    }
  };

  const handleCloseCamera = () => {
    setCapturedImage(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[100dvh] p-0">
        <CameraCapture 
          mode={scanMode} 
          onCapture={handleCapture} 
          onClose={handleCloseCamera}
          isProcessing={processingImage}
          capturedImage={capturedImage}
        />
      </SheetContent>
    </Sheet>
  );
};

export default CameraModal;
