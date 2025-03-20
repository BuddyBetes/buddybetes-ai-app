
import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import CameraCapture from '@/components/camera/CameraCapture';
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
  const { toast } = useToast();

  const handleCapture = (imageDataUrl: string) => {
    if (scanMode === 'food') {
      toast({
        title: "Food scan complete",
        description: "Processing food image...",
      });
      
      setTimeout(() => {
        toast({
          title: "Food recognized",
          description: "Detected: Apple (15g carbs). Adding to your log entry.",
        });
        onOpenChange(false);
      }, 1500);
    } else {
      toast({
        title: "Meter scan complete",
        description: "Processing glucose reading...",
      });
      
      setTimeout(() => {
        toast({
          title: "Reading detected",
          description: "Glucose reading: 118 mg/dL. Adding to your log entry.",
        });
        onOpenChange(false);
      }, 1500);
    }
  };

  const handleCloseCamera = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[100dvh] p-0">
        <CameraCapture 
          mode={scanMode} 
          onCapture={handleCapture} 
          onClose={handleCloseCamera} 
        />
      </SheetContent>
    </Sheet>
  );
};

export default CameraModal;
