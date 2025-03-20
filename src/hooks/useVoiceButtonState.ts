
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface VoiceButtonStateProps {
  onStartSession?: () => void;
  onEndSession?: () => void;
  onSpeechResult?: (text: string) => void;
  isPlayingResponse: boolean;
}

export const useVoiceButtonState = ({
  onStartSession,
  onEndSession,
  onSpeechResult,
  isPlayingResponse
}: VoiceButtonStateProps) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [playbackCompleted, setPlaybackCompleted] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Handle changes to isPlayingResponse
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

  // Clear error when status changes
  useEffect(() => {
    if (status !== 'idle') {
      setErrorMsg(null);
    }
  }, [status]);

  // Log status changes
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

  return {
    status,
    errorMsg,
    playbackCompleted,
    lastUserMessage,
    lastAssistantMessage,
    setStatus,
    setErrorMsg,
    setLastUserMessage,
    setPlaybackCompleted
  };
};
