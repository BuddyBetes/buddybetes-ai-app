
import React from 'react';
import { PlusCircle, Camera, Clock } from 'lucide-react';

interface QuickActionButtonsProps {
  onScanFood: () => void;
  onScanMeter: () => void;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ 
  onScanFood,
  onScanMeter
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <button
        onClick={onScanFood}
        className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm"
      >
        <Camera className="h-8 w-8 text-buddy-500 mb-2" />
        <span className="text-sm font-medium">Scan Food</span>
      </button>
      
      <button
        onClick={onScanMeter}
        className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm"
      >
        <PlusCircle className="h-8 w-8 text-buddy-500 mb-2" />
        <span className="text-sm font-medium">Scan Meter</span>
      </button>
      
      <button
        className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm"
      >
        <Clock className="h-8 w-8 text-buddy-500 mb-2" />
        <span className="text-sm font-medium">Schedule</span>
      </button>
    </div>
  );
};

export default QuickActionButtons;
