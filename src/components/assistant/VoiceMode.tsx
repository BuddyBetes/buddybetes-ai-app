
import React from 'react';
import { motion } from 'framer-motion';
import VoiceButton from '../VoiceButton';
import { AssistantHookReturn } from '@/hooks/assistant/types';

interface VoiceModeProps {
  handleStartSession: () => void;
  handleEndSession: () => void;
  handleTextMode: () => void;
  handleSpeechResult: (text: string) => void;
  isPlayingResponse: boolean;
  isLoading: boolean;
}

const VoiceMode: React.FC<VoiceModeProps> = ({
  handleStartSession,
  handleEndSession,
  handleTextMode,
  handleSpeechResult,
  isPlayingResponse,
  isLoading
}) => {
  return (
    <motion.div
      key="voice-mode"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full w-full flex-grow"
    >
      <div className="flex items-center justify-center w-full h-full py-16 md:py-20">
        <VoiceButton 
          onStartSession={handleStartSession}
          onEndSession={handleEndSession}
          onTextMode={handleTextMode}
          onSpeechResult={handleSpeechResult}
          isPlayingResponse={isPlayingResponse}
          isLoading={isLoading}
        />
      </div>
    </motion.div>
  );
};

export default VoiceMode;
