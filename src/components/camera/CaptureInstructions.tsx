
import React from 'react';

interface CaptureInstructionsProps {
  mode: 'food' | 'meter';
}

const CaptureInstructions: React.FC<CaptureInstructionsProps> = ({ mode }) => {
  return (
    <div className="p-4 bg-black text-white text-center">
      <p className="font-medium mb-1">
        {mode === 'food' ? 'Food Scanner' : 'Glucose Meter Scanner'}
      </p>
      <p className="text-sm text-gray-300">
        {mode === 'food' ? 
          'Position your food item in the center of the frame' : 
          'Align your glucose meter display with the horizontal line'
        }
      </p>
    </div>
  );
};

export default CaptureInstructions;
