
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import VoiceCircle from './voice/VoiceCircle';
import SessionModeButtons from './voice/SessionModeButtons';
import VoiceControlButton from './voice/VoiceControlButton';
import AudioRecorder from './voice/AudioRecorder';

interface VoiceButtonProps {
  onStartSession?: () => void;
  onEndSession?: () => void;
  onTextMode?: () => void;
  onSpeechResult?: (text: string) => void;
  isPlayingResponse: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  onStartSession, 
  onEndSession,
  onTextMode,
  onSpeechResult,
  isPlayingResponse
}) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Initialize the audio recorder
  const { isRecording, startRecording, stopRecording } = AudioRecorder({
    onSpeechResult: (text) => {
      console.log("Speech recognized:", text);
      setStatus('processing');
      setErrorMsg(null);
      if (text.trim().length > 0) {
        onSpeechResult && onSpeechResult(text);
      } else {
        console.log("Empty text received from speech recognition");
        setStatus('idle');
      }
    },
    onProcessingStateChange: (isProcessing) => {
      if (!isProcessing && status === 'processing') {
        console.log("Processing complete, ready for speaking state");
      }
    }
  });

  // Effect to handle state changes based on external isPlayingResponse prop
  useEffect(() => {
    console.log("isPlayingResponse changed:", isPlayingResponse, "current status:", status);
    
    if (isPlayingResponse) {
      console.log("Setting status to speaking because isPlayingResponse is true");
      setStatus('speaking');
    } else if (status === 'speaking') {
      console.log("Response finished playing, setting status to idle after delay");
      const timer = setTimeout(() => {
        console.log("Timeout executed, setting status to idle");
        setStatus('idle');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayingResponse, status]);

  // Reset error message when status changes
  useEffect(() => {
    if (status !== 'idle') {
      setErrorMsg(null);
    }
  }, [status]);

  // Debugging effect to monitor status changes
  useEffect(() => {
    console.log("Voice button status changed to:", status);
  }, [status]);

  const handleToggle = () => {
    if (status === 'listening') {
      handleEndSession();
    } else {
      handleStartSession();
    }
  };

  const handleStartSession = () => {
    startRecording();
    setStatus('listening');
    setErrorMsg(null);
    onStartSession && onStartSession();
  };

  const handleEndSession = () => {
    stopRecording();
    setStatus('processing');
    onEndSession && onEndSession();
  };

  // Add a dedicated function for the X button
  const handleStopButton = () => {
    stopRecording();
    setStatus('processing');
    onEndSession && onEndSession();
  };

  const getStatusHeading = () => {
    switch(status) {
      case 'idle': return "still up? same!";
      case 'listening': return "I'm listening...";
      case 'processing': return "Processing...";
      case 'speaking': return "Speaking...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-medium mb-8 text-gray-800">
        {getStatusHeading()}
      </h1>
      
      <VoiceCircle 
        status={status} 
        onStopButtonClick={handleStopButton} 
      />
      
      {errorMsg && (
        <div className="mb-4 text-red-500 text-center">{errorMsg}</div>
      )}
      
      <SessionModeButtons status={status} />
      
      <VoiceControlButton 
        status={status}
        onClick={handleToggle}
        disabled={status === 'processing' || status === 'speaking'}
      />
      
      <Button
        variant="ghost" 
        onClick={onTextMode}
        className="mt-4 text-gray-500"
      >
        Switch to Text Mode
      </Button>
    </div>
  );
};

export default VoiceButton;
