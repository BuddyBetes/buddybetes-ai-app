
import React from 'react';
import { Button } from '@/components/ui/button';
import VoiceControlButton from './VoiceControlButton';

interface VoiceButtonFooterProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onToggle: () => void;
  onTextMode: () => void;
  playbackCompleted: boolean;
}

const VoiceButtonFooter: React.FC<VoiceButtonFooterProps> = ({ 
  status, 
  onToggle, 
  onTextMode,
  playbackCompleted 
}) => {
  return (
    <>
      <VoiceControlButton 
        status={status}
        onClick={onToggle}
        disabled={status === 'processing' || status === 'speaking'}
        playbackCompleted={playbackCompleted}
      />
      
      <Button
        variant="ghost" 
        onClick={onTextMode}
        className="mt-4 text-gray-500"
      >
        Switch to Text Mode
      </Button>
    </>
  );
};

export default VoiceButtonFooter;
