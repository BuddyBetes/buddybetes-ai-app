
import React from 'react';
import { useVoiceProcessor } from '../../hooks/useVoiceProcessor';

interface VoiceProcessorProps {
  onSpeechResult: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  setStatus: (status: 'idle' | 'listening' | 'processing' | 'speaking') => void;
  setLastUserMessage: (text: string | null) => void;
  onStartSession?: () => void;
  onEndSession?: () => void;
  children: (handlers: {
    isRecording: boolean;
    handleStartSession: () => void;
    handleEndSession: () => void;
    handleStopButton: () => void;
  }) => React.ReactNode;
}

/**
 * Component that processes voice input and provides handlers to the children
 */
const VoiceProcessor: React.FC<VoiceProcessorProps> = ({
  onSpeechResult,
  onProcessingStateChange,
  status,
  setStatus,
  setLastUserMessage,
  onStartSession,
  onEndSession,
  children
}) => {
  const voiceHandlers = useVoiceProcessor({
    onSpeechResult,
    onProcessingStateChange,
    status,
    setStatus,
    setLastUserMessage,
    onStartSession,
    onEndSession
  });

  return <>{children(voiceHandlers)}</>;
};

export default VoiceProcessor;
