
import { useEffect, useState } from 'react';
import { useUIState } from './useUIState';
import { useMessageHandling } from './useMessageHandling';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { Message } from '@/types';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';
import { extractGlucoseInfo, isGlucoseLogIntent } from '@/utils/voiceParser';

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
  const { addLog } = useLogContext();
  const { toast } = useToast();
  const [logCreated, setLogCreated] = useState(false);
  
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
  
  // Enhanced speech result handler that also extracts log data
  const handleSpeechResult = async (text: string) => {
    // First, process the speech normally
    await originalHandleSpeechResult(text);
    
    // Then check if it contains glucose logging intent
    if (isGlucoseLogIntent(text)) {
      const logInfo = extractGlucoseInfo(text);
      
      if (logInfo && logInfo.glucoseLevel) {
        // Create a new log
        addLog({
          timestamp: new Date(),
          glucoseLevel: logInfo.glucoseLevel,
          food: logInfo.food,
          mealContext: logInfo.mealContext,
          notes: logInfo.notes
        });
        
        setLogCreated(true);
        
        // Show a toast notification
        toast({
          title: "Log Added",
          description: `Glucose reading of ${logInfo.glucoseLevel} mg/dL added to your logs.`,
          duration: 5000
        });
        
        // Add a confirmation message from the assistant
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              text: `I've added your glucose reading of ${logInfo.glucoseLevel} mg/dL to your logs.${
                logInfo.mealContext ? ` Context: ${logInfo.mealContext} meal.` : ''
              }${
                logInfo.food ? ` Food: ${logInfo.food}.` : ''
              }`,
              type: 'assistant',
              timestamp: Date.now(),
              isNew: true
            }
          ]);
          
          if (mode === 'voice' && playResponseAudio) {
            playResponseAudio(`I've added your glucose reading of ${logInfo.glucoseLevel} mg/dL to your logs.`);
          }
        }, 1000);
      }
    }
  };
  
  // Reset log created flag when mode changes
  useEffect(() => {
    setLogCreated(false);
  }, [mode]);
  
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
    setShowScrollButton,
    logCreated
  };
};

// Re-export constants for backwards compatibility
export { TIME_GROUPS } from './constants';
