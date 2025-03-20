
import React from 'react';
import { Button } from '@/components/ui/button';
import { Keyboard, Mic } from 'lucide-react';
import LanguageToggle from './LanguageToggle';

interface VoiceButtonFooterProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onToggle: () => void;
  onTextMode: () => void;
  playbackCompleted: boolean;
  isTaglishEnabled?: boolean;
  onToggleLanguage?: (enabled: boolean) => void;
}

const VoiceButtonFooter: React.FC<VoiceButtonFooterProps> = ({ 
  status, 
  onToggle, 
  onTextMode, 
  playbackCompleted,
  isTaglishEnabled = false,
  onToggleLanguage = () => {}
}) => {
  return (
    <div className="w-full flex flex-col items-center mt-8 space-y-6">
      <div className="flex items-center justify-center space-x-2">
        <Button 
          onClick={onToggle}
          variant="outline" 
          size="sm"
          className="flex items-center space-x-1 text-sm"
          disabled={status === 'processing' || status === 'speaking'}
        >
          <Mic size={16} />
          <span>{status === 'listening' ? 'Stop' : 'Start'} listening</span>
        </Button>
        
        <Button 
          onClick={onTextMode}
          variant="outline" 
          size="sm"
          className="flex items-center space-x-1 text-sm"
        >
          <Keyboard size={16} />
          <span>Text mode</span>
        </Button>
      </div>

      <div className="flex items-center justify-center">
        <LanguageToggle 
          isTaglishEnabled={isTaglishEnabled} 
          onToggleLanguage={onToggleLanguage} 
        />
      </div>
    </div>
  );
};

export default VoiceButtonFooter;
