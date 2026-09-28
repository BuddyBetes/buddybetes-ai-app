import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import CameraCapture from './CameraCapture';

interface CameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageCapture: (imageData: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ 
  open, 
  onOpenChange,
  onImageCapture
}) => {
  const handleCapture = (imageData: string) => {
    onImageCapture(imageData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] p-0">
        <VisuallyHidden>
          <SheetTitle>Food Photo Capture</SheetTitle>
        </VisuallyHidden>
        <div id="camera-description" className="sr-only">
          Use your camera to take a photo of your food for automatic logging
        </div>
        <div className="flex flex-col h-full" aria-describedby="camera-description">
          <div className="flex-1 flex items-center justify-center">
            {open && (
              <CameraCapture 
                onCapture={handleCapture} 
                onClose={() => onOpenChange(false)} 
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CameraModal;