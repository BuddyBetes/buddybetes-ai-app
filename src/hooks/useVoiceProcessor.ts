
import { useState } from 'react';
import AudioRecorder from '../components/voice/AudioRecorder';

interface UseVoiceProcessorProps {
  onSpeechResult: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  setStatus: (status: 'idle' | 'listening' | 'processing' | 'speaking') => void;
  setLastUserMessage: (text: string | null) => void;
  onStartSession?: () => void;
  onEndSession?: () => void;
}

/**
 * Hook that manages the voice processing logic
 */
export const useVoiceProcessor = ({
  onSpeechResult,
  onProcessingStateChange,
  status,
  setStatus,
  setLastUserMessage,
  onStartSession,
  onEndSession
}: UseVoiceProcessorProps) => {
  const { isRecording, startRecording, stopRecording } = AudioRecorder({
    onSpeechResult: (text) => {
      console.log("Speech recognized:", text);
      setStatus('processing');
      setLastUserMessage(text);
      
      if (text.trim().length > 0) {
        onSpeechResult && onSpeechResult(text);
      } else {
        console.log("Empty text received from speech recognition");
        setStatus('idle');
      }
    },
    onProcessingStateChange: (isProcessing) => {
      console.log("Processing state changed:", isProcessing);
      onProcessingStateChange(isProcessing);
    }
  });

  const handleStartSession = () => {
    try {
      startRecording().catch(error => {
        console.error("Error starting recording:", error);
        setStatus('idle');
        return;
      });
      
      setStatus('listening');
      onStartSession && onStartSession();
    } catch (error) {
      console.error("Error in handleStartSession:", error);
      setStatus('idle');
    }
  };

  const handleEndSession = () => {
    try {
      stopRecording();
      setStatus('processing');
      onEndSession && onEndSession();
    } catch (error) {
      console.error("Error in handleEndSession:", error);
      setStatus('idle');
    }
  };

  const handleStopButton = () => {
    try {
      stopRecording();
      setStatus('processing');
      onEndSession && onEndSession();
    } catch (error) {
      console.error("Error in handleStopButton:", error);
      setStatus('idle');
    }
  };

  return {
    isRecording,
    handleStartSession,
    handleEndSession,
    handleStopButton
  };
};
