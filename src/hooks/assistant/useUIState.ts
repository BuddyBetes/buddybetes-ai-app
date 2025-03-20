
import { useState, useEffect, useRef } from 'react';

export const useUIState = () => {
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check if this is the first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('assistantVisited');
    if (hasVisitedBefore) {
      setShowWelcome(false);
    } else {
      localStorage.setItem('assistantVisited', 'true');
    }
  }, []);

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
  };
  
  const handleVoiceMode = () => {
    console.log("Switching to voice mode");
    setMode('voice');
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
