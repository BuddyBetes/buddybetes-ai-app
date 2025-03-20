
import { useState, useEffect, useMemo, useRef } from 'react';
import { useLogContext } from '@/context/LogContext';
import { useMessageHandling } from './useMessageHandling';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useUIState } from './useUIState';

// Time groups for message display
export const TIME_GROUPS = {
  recent: 1000 * 60 * 60, // Last hour
  today: 1000 * 60 * 60 * 24, // Last 24 hours
  week: 1000 * 60 * 60 * 24 * 7, // Last week
  earlier: Infinity // Anything before
};

export const useAssistant = () => {
  // UI State Management
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
  
  // Audio playback handling
  const { playResponseAudio, isPlayingResponse } = useSpeechSynthesis();
  
  // Message handling
  const {
    messages,
    input,
    isLoading,
    handleUserMessage,
    handleInputChange,
    handleSend,
    handleSpeechResult: baseHandleSpeechResult,
    setMessages
  } = useMessageHandling(playResponseAudio, mode);
  
  // Handle Taglish mode in speech results
  const handleSpeechResult = async (text: string, isTaglish?: boolean) => {
    console.log(`Processing speech result${isTaglish ? ' (Taglish mode)' : ''}:`, text);
    
    // If Taglish is enabled, we add a special instruction to the AI
    if (isTaglish) {
      // For Taglish, we add a custom instruction to the message
      const taglishPrompt = text + "\n\n(Please respond in Taglish - mix of Tagalog and English)";
      await baseHandleSpeechResult(taglishPrompt);
    } else {
      await baseHandleSpeechResult(text);
    }
  };
  
  // Perform suggestion selection
  const handleSuggestionSelect = async (suggestion: string) => {
    await handleUserMessage(suggestion);
  };
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && mode === 'text') {
      scrollToBottom();
    }
  }, [messages, mode, scrollToBottom]);
  
  // Handle scroll detection for showing the scroll-to-bottom button
  useEffect(() => {
    const handleScroll = () => {
      if (mode !== 'text') return;
      
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      
      const isScrolledUp = scrollPosition + windowHeight < fullHeight - 100;
      setShowScrollButton(isScrolledUp);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode, setShowScrollButton]);
  
  return {
    mode,
    messages,
    input,
    isLoading,
    showWelcome,
    showScrollButton,
    messagesEndRef,
    isPlayingResponse,
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
