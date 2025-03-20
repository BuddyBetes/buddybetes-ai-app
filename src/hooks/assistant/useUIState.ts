
import { useState, useEffect, useRef } from 'react';

export const useUIState = () => {
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track previous mode to handle transitions
  const prevModeRef = useRef<'voice' | 'text'>(mode);
  
  // Check if this is the first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('assistantVisited');
    if (hasVisitedBefore) {
      setShowWelcome(false);
    } else {
      localStorage.setItem('assistantVisited', 'true');
    }
  }, []);

  // Update previous mode ref when mode changes
  useEffect(() => {
    prevModeRef.current = mode;
  }, [mode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleDismissWelcome = () => {
    setShowWelcome(false);
  };
  
  const handleStartSession = () => {
    // Preserve messages when switching to voice mode
    console.log("Starting voice session...");
  };
  
  const handleEndSession = () => {
    console.log("Ending voice session...");
  };
  
  const handleTextMode = () => {
    console.log("Switching to text mode");
    setMode('text');
    // Messages are preserved since they're stored in useMessageHandling
  };
  
  const handleVoiceMode = () => {
    console.log("Switching to voice mode");
    setMode('voice');
    // Messages are preserved since they're stored in useMessageHandling
  };
  
  return {
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
  };
};
