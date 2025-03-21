
import React from 'react';
import { PlusCircle, Camera, Clock, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionButtonsProps {
  onScanFood: () => void;
  onScanMeter: () => void;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ 
  onScanFood,
  onScanMeter
}) => {
  const navigate = useNavigate();
  
  const handleScheduleClick = () => {
    // Navigate to the assistant page with state indicating this is for scheduling
    navigate('/assistant', { 
      state: { 
        from: 'add-log',
        intent: 'schedule'
      } 
    });
  };

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
        onClick={handleScheduleClick}
        className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm"
      >
        <div className="relative">
          <Clock className="h-8 w-8 text-buddy-500 mb-2" />
          <Mic className="h-4 w-4 text-buddy-500 absolute -right-1 -bottom-1" />
        </div>
        <span className="text-sm font-medium">Schedule</span>
      </button>
    </div>
  );
};

export default QuickActionButtons;
