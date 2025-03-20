
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CapturedImageViewProps {
  imageUrl: string;
  onClose: () => void;
  isProcessing: boolean;
}

const CapturedImageView: React.FC<CapturedImageViewProps> = ({ 
  imageUrl, 
  onClose, 
  isProcessing 
}) => {
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Captured" 
          className="w-full h-full object-contain"
        />
        
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
              <p>Processing image...</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white bg-black/30 hover:bg-black/50"
          onClick={onClose}
          disabled={isProcessing}
        >
          <X />
        </Button>
      </div>
    </div>
  );
};

export default CapturedImageView;
