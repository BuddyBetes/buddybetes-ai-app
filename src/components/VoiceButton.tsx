
import React, { useState, useEffect } from 'react';
import VoiceCircle from './voice/VoiceCircle';
import SessionModeButtons from './voice/SessionModeButtons';
import VoiceSubtitles from './voice/VoiceSubtitles';
import VoiceInitializing from './voice/VoiceInitializing';
import VoiceStatusHeading from './voice/VoiceStatusHeading';
import VoiceButtonFooter from './voice/VoiceButtonFooter';
import VoiceProcessor from './voice/VoiceProcessor';
import { useVoiceButtonState } from '@/hooks/useVoiceButtonState';
import { useToast } from '@/hooks/use-toast';

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
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  
  // Initialize state and status handling
  const {
    status,
    errorMsg,
    playbackCompleted,
    lastUserMessage,
    lastAssistantMessage,
    setStatus,
    setLastUserMessage,
    setPlaybackCompleted
  } = useVoiceButtonState({
    onStartSession,
    onEndSession,
    onSpeechResult,
    isPlayingResponse
  });

  // Add loading state that resolves after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return <VoiceInitializing />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 max-w-md mx-auto pt-10">
      <VoiceStatusHeading status={status} />
      
      <VoiceProcessor
        onSpeechResult={onSpeechResult || (() => {})}
        onProcessingStateChange={(isProcessing) => {
          if (!isProcessing && status === 'processing') {
            console.log("Processing complete, ready for speaking state");
          }
        }}
        status={status}
        setStatus={setStatus}
        setLastUserMessage={setLastUserMessage}
        onStartSession={onStartSession}
        onEndSession={onEndSession}
      >
        {({ isRecording, handleStartSession, handleEndSession, handleStopButton }) => (
          <>
            <VoiceCircle 
              status={status} 
              onStopButtonClick={handleStopButton}
              onClick={status !== 'processing' && status !== 'speaking' ? 
                () => {
                  if (status === 'listening') {
                    handleEndSession();
                  } else {
                    handleStartSession();
                  }
                } : undefined}
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
              onToggle={() => {
                if (status === 'listening') {
                  handleEndSession();
                } else {
                  handleStartSession();
                }
              }}
              onTextMode={onTextMode || (() => {})}
              playbackCompleted={playbackCompleted}
            />
          </>
        )}
      </VoiceProcessor>
    </div>
  );
};

export default VoiceButton;
