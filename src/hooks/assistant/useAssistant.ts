import { useEffect } from 'react';
import { useUIState } from './useUIState';
import { useMessageHandling } from './useMessageHandling';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useGlucoseLogging } from './useGlucoseLogging';
import { Message } from '@/types';
import { TIME_GROUPS } from './constants';

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
    handleSpeechResult: originalHandleSpeechResult,
    setMessages
  } = useMessageHandling(playResponseAudio, mode);
  
  const {
    logCreated,
    askForTime,
    processGlucoseLogIntent,
    processViewLogsNavigation,
    handleLogCreated
  } = useGlucoseLogging(setMessages, playResponseAudio, mode);
  
  // Custom speech result handler that first checks for glucose logging intents
  const handleSpeechResult = async (text: string) => {
    // First check if this is a glucose logging intent
    const isGlucoseLog = await processGlucoseLogIntent(text);
    
    // If it's not a glucose log, handle it with the regular flow
    if (!isGlucoseLog) {
      await originalHandleSpeechResult(text);
    }
  };

  // Handle log creation follow-up
  useEffect(() => {
    handleLogCreated();
  }, [logCreated]);
  
  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          text: "Hi! I'm BuddyBetes. How can I help?",
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

  // Process message with possible navigation logic
  const processMessage = (text: string) => {
    const shouldNavigate = processViewLogsNavigation(text);
    if (!shouldNavigate) {
      return handleUserMessage(text);
    }
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
    handleSend: () => processMessage(input),
    handleSpeechResult,
    scrollToBottom,
    setShowScrollButton,
    logCreated,
    askForTime
  };
};

export { TIME_GROUPS } from './constants';
