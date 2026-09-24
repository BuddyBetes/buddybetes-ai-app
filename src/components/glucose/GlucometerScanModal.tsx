import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import GlucometerCapture from './GlucometerCapture';

interface GlucometerScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReadingCapture: (reading: number) => void;
}

const GlucometerScanModal: React.FC<GlucometerScanModalProps> = ({ 
  open, 
  onOpenChange,
  onReadingCapture
}) => {
  const handleCapture = (reading: number) => {
    onReadingCapture(reading);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] p-0">
        <VisuallyHidden>
          <SheetTitle>Glucometer Reading Capture</SheetTitle>
        </VisuallyHidden>
        <div id="glucometer-description" className="sr-only">
          Use your camera to take a photo of your glucometer display for automatic reading
        </div>
        <div className="flex flex-col h-full" aria-describedby="glucometer-description">
          <div className="flex-1 flex items-center justify-center">
            {open && (
              <GlucometerCapture 
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

export default GlucometerScanModal;
