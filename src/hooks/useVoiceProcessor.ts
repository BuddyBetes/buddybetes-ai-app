
import { useState, useCallback } from 'react';
import { useAudioCapture } from './useAudioCapture';
import { processSpeechFromBlob } from '@/utils/speechProcessing';
import { toast } from '@/hooks/use-toast';

interface UseVoiceProcessorProps {
  onSpeechResult: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  setStatus: (status: 'idle' | 'listening' | 'processing' | 'speaking') => void;
  setLastUserMessage: (text: string | null) => void;
  onStartSession?: () => void;
  onEndSession?: () => void;
  language?: string;
}

export const useVoiceProcessor = ({
  onSpeechResult,
  onProcessingStateChange,
  status,
  setStatus,
  setLastUserMessage,
  onStartSession,
  onEndSession,
  language = "en"
}: UseVoiceProcessorProps) => {
  const [isRecording, setIsRecording] = useState(false);
  
  const {
    startRecording,
    stopRecording,
    getAudioBlob,
    stopMediaTracks
  } = useAudioCapture();
  
  // Process the audio after it's been recorded
  const processAudio = useCallback(async () => {
    setStatus('processing');
    
    const audioBlob = getAudioBlob();
    if (!audioBlob || audioBlob.size < 100) {
      console.log("No audio to process");
      toast({
        title: "No Speech Detected",
        description: "Please try again and speak clearly.",
        variant: "destructive"
      });
      setStatus('idle');
      onProcessingStateChange(false);
      return;
    }
    
    try {
      await processSpeechFromBlob(
        audioBlob, 
        { 
          onSpeechResult,
          onProcessingStateChange,
          language 
        }
      );
    } catch (error) {
      console.error("Error processing speech:", error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing your speech.",
        variant: "destructive"
      });
      setStatus('idle');
      onProcessingStateChange(false);
    }
  }, [getAudioBlob, onProcessingStateChange, onSpeechResult, setStatus, language]);
  
  // Start a new listening session
  const handleStartSession = useCallback(() => {
    console.log("Starting session, status:", status);
    
    if (status === 'listening') {
      return;
    }
    
    setIsRecording(true);
    setStatus('listening');
    startRecording();
    
    if (onStartSession) {
      onStartSession();
    }
  }, [status, startRecording, setStatus, onStartSession]);
  
  // End the current listening session and process audio
  const handleEndSession = useCallback(async () => {
    console.log("Ending session, status:", status);
    
    if (status !== 'listening' || !isRecording) {
      return;
    }
    
    setIsRecording(false);
    stopRecording();
    stopMediaTracks();

    await processAudio();
    
    if (onEndSession) {
      onEndSession();
    }
  }, [status, isRecording, stopRecording, stopMediaTracks, processAudio, onEndSession]);
  
  // Handle the stop button click (for emergency stop)
  const handleStopButton = useCallback(() => {
    console.log("Stop button clicked, status:", status);
    
    if (status === 'listening') {
      setIsRecording(false);
      stopRecording();
      stopMediaTracks();
      setStatus('idle');
      if (onEndSession) {
        onEndSession();
      }
    }
  }, [status, stopRecording, stopMediaTracks, setStatus, onEndSession]);
  
  return {
    isRecording,
    handleStartSession,
    handleEndSession,
    handleStopButton
  };
};
