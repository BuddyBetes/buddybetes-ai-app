
import React from 'react';
import { Loader2 } from 'lucide-react';

const VoiceInitializing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex flex-col items-center justify-center h-full pt-16">
        <div className="w-48 h-48 rounded-full bg-[#f0f9f7] flex items-center justify-center">
          <Loader2 size={64} className="text-[#35cab4] animate-spin" />
        </div>
        <h2 className="mt-8 text-xl font-medium text-gray-700">Initializing voice...</h2>
      </div>
    </div>
  );
};

export default VoiceInitializing;
