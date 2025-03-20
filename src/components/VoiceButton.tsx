import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import VoiceCircle from './voice/VoiceCircle';
import SessionModeButtons from './voice/SessionModeButtons';
import VoiceControlButton from './voice/VoiceControlButton';
import AudioRecorder from './voice/AudioRecorder';
import VoiceSubtitles from './voice/VoiceSubtitles';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, Mic } from 'lucide-react';

interface VoiceButtonProps {
  onStartSession?: () => void;
  onEndSession?: () => void;
  onTextMode?: () => void;
  onSpeechResult?: (text: string) => void;
  isPlayingResponse: boolean;
  isLoading?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  onStartSession, 
  onEndSession,
  onTextMode,
  onSpeechResult,
  isPlayingResponse,
  isLoading = false
}) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [playbackCompleted, setPlaybackCompleted] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
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

  if (isInitializing) {
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
      <h1 className="text-2xl font-medium mb-10 text-center text-gray-800">
        {getStatusHeading()}
      </h1>
      
      <div className="relative mb-16 w-56 h-56">
        <button 
          onClick={status !== 'processing' && status !== 'speaking' ? handleToggle : undefined}
          className="w-full h-full rounded-full bg-[#35cab4] flex items-center justify-center shadow-lg hover:bg-[#2ba999] transition-all"
          disabled={status === 'processing' || status === 'speaking'}
        >
          <Mic size={72} className="text-white" />
        </button>
      </div>
      
      <VoiceSubtitles 
        userMessage={lastUserMessage} 
        assistantMessage={lastAssistantMessage}
        isLoading={status === 'processing' && !isPlayingResponse}
      />
      
      {errorMsg && (
        <div className="mb-4 text-red-500 text-center">{errorMsg}</div>
      )}
      
      <button 
        onClick={handleToggle}
        disabled={status === 'processing' || status === 'speaking'}
        className={`
          bg-[#35cab4] hover:bg-[#2ba999] text-white rounded-full px-12 py-4 text-lg font-medium 
          w-64 flex items-center justify-center transition-all mb-6
          ${status === 'processing' || status === 'speaking' ? 'opacity-80 cursor-not-allowed' : ''}
        `}
      >
        {status === 'listening' ? 'end session' : (playbackCompleted ? 'continue session' : 'begin session')}
      </button>
      
      <Button
        variant="ghost" 
        onClick={onTextMode}
        className="text-gray-500 hover:text-gray-700"
      >
        Switch to Text Mode
      </Button>
    </div>
  );
};

export default VoiceButton;
