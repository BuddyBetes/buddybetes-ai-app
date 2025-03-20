
import React from 'react';

interface CaptureOverlayProps {
  mode: 'food' | 'meter';
}

const CaptureOverlay: React.FC<CaptureOverlayProps> = ({ mode }) => {
  if (mode === 'food') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-[70%] h-[70%] border-2 border-white rounded-xl"></div>
        </div>
        <div className="absolute bottom-24 left-0 right-0 text-center text-white bg-black/30 py-2">
          Center the food item in the frame
        </div>
      </div>
    );
  } else {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-[80%] h-[30%] border-2 border-white rounded-lg">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-[90%] border-t-2 border-white"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-24 left-0 right-0 text-center text-white bg-black/30 py-2">
          Align glucose reading with the line
        </div>
      </div>
    );
  }
};

export default CaptureOverlay;
