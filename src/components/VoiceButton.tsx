
import React, { useState, useEffect } from 'react';
import VoiceCircle from './voice/VoiceCircle';
import SessionModeButtons from './voice/SessionModeButtons';
import AudioRecorder from './voice/AudioRecorder';
import VoiceSubtitles from './voice/VoiceSubtitles';
import VoiceInitializing from './voice/VoiceInitializing';
import VoiceStatusHeading from './voice/VoiceStatusHeading';
import VoiceButtonFooter from './voice/VoiceButtonFooter';

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
  
  // Add loading state that resolves after a short delay
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

  if (isInitializing) {
    return <VoiceInitializing />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 max-w-md mx-auto pt-10">
      <VoiceStatusHeading status={status} />
      
      <VoiceCircle 
        status={status} 
        onStopButtonClick={handleStopButton}
        onClick={status !== 'processing' && status !== 'speaking' ? handleToggle : undefined}
      />
      
      <VoiceSubtitles 
        userMessage={lastUserMessage} 
        assistantMessage={lastAssistantMessage}
        isLoading={status === 'processing' && !isPlayingResponse}
      />
      
      {errorMsg && (
        <div className="mb-4 text-red-500 text-center">{errorMsg}</div>
      )}
      
      <SessionModeButtons status={status} />
      
      <VoiceButtonFooter 
        status={status}
        onToggle={handleToggle}
        onTextMode={onTextMode || (() => {})}
        playbackCompleted={playbackCompleted}
      />
    </div>
  );
};

export default VoiceButton;
