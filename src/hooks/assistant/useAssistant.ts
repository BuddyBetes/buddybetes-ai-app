
import { useEffect } from 'react';
import { useUIState } from './useUIState';
import { useMessageHandling } from './useMessageHandling';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { Message } from '@/types';

export const useAssistant = () => {
  const {
    mode,
    showWelcome,
    showScrollButton,
    messagesEndRef,
    handleStartSession,
    handleEndSession,
    handleTextMode,
    handleVoiceMode,
    handleDismissWelcome,
    scrollToBottom,
    setShowScrollButton
  } = useUIState();

  const { isPlayingResponse, playResponseAudio } = useSpeechSynthesis();
  
  const {
    messages,
    input,
    isLoading,
    handleUserMessage,
    handleInputChange,
    handleSend,
    handleSpeechResult,
    setMessages
  } = useMessageHandling(playResponseAudio, mode);
  
  // Add initial system message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          text: "Hello! I'm your Glucose Buddy Assistant. How can I help you today?",
          type: 'assistant',
          timestamp: Date.now(),
          isNew: true
        }
      ]);
    }
  }, [messages.length, setMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSuggestionSelect = (suggestion: string) => {
    handleInputChange(suggestion);
  };

  return {
    mode,
    messages,
    input,
    isLoading,
    showWelcome,
    showScrollButton,
    isPlayingResponse,
    messagesEndRef,
    handleStartSession,
    handleEndSession,
    handleTextMode,
    handleVoiceMode,
    handleInputChange,
    handleSuggestionSelect,
    handleDismissWelcome,
    handleSend,
    handleSpeechResult,
    scrollToBottom,
    setShowScrollButton
  };
};

// Re-export constants for backwards compatibility
export { TIME_GROUPS } from './constants';
