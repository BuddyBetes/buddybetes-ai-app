
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, X, Loader } from 'lucide-react';

interface VoiceControlButtonProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onClick: () => void;
  disabled: boolean;
  playbackCompleted?: boolean;
}

const VoiceControlButton: React.FC<VoiceControlButtonProps> = ({ 
  status, 
  onClick, 
  disabled,
  playbackCompleted = false
}) => {
  const renderButtonContent = () => {
    switch (status) {
      case 'listening':
        return <X size={24} className="text-white" />;
      case 'processing':
        return <Loader size={24} className="text-white animate-spin" />;
      case 'speaking':
        return <Mic size={24} className="text-white" />;
      default:
        return (
          <span className="text-white font-medium">
            {playbackCompleted ? "Continue session" : "Begin session"}
          </span>
        );
    }
  };

  return (
    <Button 
      onClick={onClick}
      disabled={disabled}
      className={`bg-[#208687] hover:bg-[#1b7273] text-white rounded-full px-12 py-6 text-lg font-medium w-64 flex items-center justify-center transition-all ${status === 'processing' || status === 'speaking' ? 'opacity-80' : ''}`}
    >
      {renderButtonContent()}
    </Button>
  );
};

export default VoiceControlButton;
