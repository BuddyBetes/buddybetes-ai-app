
import React from 'react';
import { Button } from '@/components/ui/button';

interface SessionModeButtonsProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
}

const SessionModeButtons: React.FC<SessionModeButtonsProps> = ({ status }) => {
  return (
    <div className="flex space-x-4 mb-6">
      <Button 
        variant="outline" 
        className={`rounded-full px-8 py-2 ${status === 'idle' ? 'bg-gray-100 border-gray-200 text-gray-800' : 'bg-white border-gray-200 text-gray-400'}`}
      >
        classic
      </Button>
      <Button 
        variant="outline" 
        className="rounded-full px-8 py-2 bg-white border-gray-200 text-gray-400"
      >
        guided
      </Button>
    </div>
  );
};

export default SessionModeButtons;
