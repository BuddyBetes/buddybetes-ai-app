
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import VoiceCircle from './voice/VoiceCircle';
import SessionModeButtons from './voice/SessionModeButtons';
import VoiceControlButton from './voice/VoiceControlButton';
import AudioRecorder from './voice/AudioRecorder';
import VoiceSubtitles from './voice/VoiceSubtitles';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';

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
  const [playbackCompleted, setPlaybackCompleted] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Add loading state that resolves after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  
  const { isRecording, startRecording, stopRecording } = AudioRecorder({
    onSpeechResult: (text) => {
      console.log("Speech recognized:", text);
      setStatus('processing');
      setErrorMsg(null);
      setLastUserMessage(text);
      
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

  useEffect(() => {
    console.log("isPlayingResponse changed:", isPlayingResponse, "current status:", status);
    
    if (isPlayingResponse) {
      console.log("Setting status to speaking because isPlayingResponse is true");
      setStatus('speaking');
      setPlaybackCompleted(false);
    } else if (status === 'speaking') {
      console.log("Response finished playing, setting status to idle after delay");
      const timer = setTimeout(() => {
        console.log("Timeout executed, setting status to idle");
        setStatus('idle');
        setPlaybackCompleted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayingResponse, status]);

  useEffect(() => {
    if (status !== 'idle') {
      setErrorMsg(null);
    }
  }, [status]);

  useEffect(() => {
    console.log("Voice button status changed to:", status);
  }, [status]);

  // Listen for messages in the assistant context
  useEffect(() => {
    const handleMessageUpdate = (event: CustomEvent) => {
      if (event.detail?.type === 'assistant' && event.detail?.text) {
        setLastAssistantMessage(event.detail.text);
      }
    };

    window.addEventListener('new-message' as any, handleMessageUpdate);
    return () => {
      window.removeEventListener('new-message' as any, handleMessageUpdate);
    };
  }, []);

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
    setPlaybackCompleted(false);
    onStartSession && onStartSession();
  };

  const handleEndSession = () => {
    stopRecording();
    setStatus('processing');
    onEndSession && onEndSession();
  };

  const handleStopButton = () => {
    stopRecording();
    setStatus('processing');
    onEndSession && onEndSession();
  };

  const getStatusHeading = () => {
    switch(status) {
      case 'idle': return "Any questions?";
      case 'listening': return "I'm listening...";
      case 'processing': return "Processing...";
      case 'speaking': return "Speaking...";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full px-4 max-w-md mx-auto">
        <div className="w-48 h-48 rounded-full bg-[#35cab4]/30 flex items-center justify-center">
          <Loader2 size={64} className="text-[#35cab4] animate-spin" />
        </div>
        <h2 className="mt-8 text-xl font-medium text-gray-700">Initializing voice...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 max-w-md mx-auto">
      <h1 className={`text-2xl ${isMobile ? 'text-xl' : 'text-3xl'} font-medium mb-4 md:mb-6 text-gray-800`}>
        {getStatusHeading()}
      </h1>
      
      <VoiceSubtitles 
        userMessage={lastUserMessage} 
        assistantMessage={lastAssistantMessage}
      />
      
      <VoiceCircle 
        status={status} 
        onStopButtonClick={handleStopButton}
        onClick={status !== 'processing' && status !== 'speaking' ? handleToggle : undefined}
      />
      
      {errorMsg && (
        <div className="mb-4 text-red-500 text-center">{errorMsg}</div>
      )}
      
      <SessionModeButtons status={status} />
      
      <VoiceControlButton 
        status={status}
        onClick={handleToggle}
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
    </div>
  );
};

export default VoiceButton;
