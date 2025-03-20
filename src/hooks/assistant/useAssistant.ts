
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
  
  const handleSpeechResult = async (text: string) => {
    console.log("Processing voice input for glucose logging intent...");
    
    if (isGlucoseLogIntent(text)) {
      console.log("Glucose logging intent detected in voice input!");
      const logInfo = extractGlucoseInfo(text);
      console.log("Extracted log info:", logInfo);
      
      if (logInfo && logInfo.glucoseLevel) {
        const newLog = {
          timestamp: new Date(),
          glucoseLevel: logInfo.glucoseLevel,
          food: logInfo.food || "",
          mealContext: logInfo.mealContext || "after",
          notes: logInfo.notes || ""
        };
        
        console.log("Creating new glucose log:", newLog);
        addLog(newLog);
        
        setLogCreated(true);
        
        toast({
          title: "Log Added",
          description: `Glucose reading of ${logInfo.glucoseLevel} mg/dL added to your logs.`,
          duration: 5000
        });
        
        const confirmationMessage = `I've added your glucose reading of ${logInfo.glucoseLevel} mg/dL to your logs.${
          logInfo.mealContext ? ` Context: ${logInfo.mealContext} meal.` : ''
        }${
          logInfo.food ? ` Food: ${logInfo.food}.` : ''
        }`;
        
        setMessages(prev => [
          ...prev,
          {
            text: text,
            type: 'user',
            timestamp: Date.now(),
            isNew: true
          },
          {
            text: confirmationMessage,
            type: 'assistant',
            timestamp: Date.now(),
            isNew: true
          }
        ]);
        
        if (mode === 'voice' && playResponseAudio) {
          playResponseAudio(confirmationMessage);
        }
        
        return;
      }
    }
    
    await originalHandleSpeechResult(text);
  };
  
  useEffect(() => {
    setLogCreated(false);
  }, [mode]);
  
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

export { TIME_GROUPS } from './constants';
