
import { useEffect, useState, useRef } from 'react';
import { useUIState } from './useUIState';
import { useMessageHandling } from './useMessageHandling';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { Message } from '@/types';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';
import { extractGlucoseInfo, isGlucoseLogIntent } from '@/utils/voiceParser';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [askForTime, setAskForTime] = useState(false);
  const pendingLogRef = useRef<any>(null);
  
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
        // Check if time information is missing
        const timeSpecified = text.includes("now") || 
                             text.includes("just now") || 
                             text.includes("a moment ago") || 
                             text.includes("minutes ago") || 
                             text.includes("hours ago") ||
                             text.match(/at \d{1,2}:\d{2}/i);
        
        if (!timeSpecified) {
          setAskForTime(true);
          pendingLogRef.current = logInfo;
          
          // Ask for time information
          const timeQuestion = `When was this ${logInfo.glucoseLevel} mg/dL reading taken?`;
          
          setMessages(prev => [
            ...prev,
            {
              text: text,
              type: 'user',
              timestamp: Date.now(),
              isNew: true
            },
            {
              text: timeQuestion,
              type: 'assistant',
              timestamp: Date.now(),
              isNew: true
            }
          ]);
          
          if (mode === 'voice' && playResponseAudio) {
            await playResponseAudio(timeQuestion);
          }
          
          return;
        }
        
        // If time is specified or not needed, create the log
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
          description: `Glucose reading of ${logInfo.glucoseLevel} mg/dL added.`,
          duration: 3000
        });
        
        const confirmationMessage = `Added ${logInfo.glucoseLevel} mg/dL to logs.${
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
          await playResponseAudio(confirmationMessage);
        }
        
        return;
      }
    } else if (askForTime && pendingLogRef.current) {
      // Process time response for pending log
      setAskForTime(false);
      const timeInfo = text;
      const logInfo = pendingLogRef.current;
      
      const newLog = {
        timestamp: new Date(), // Default to now, could be enhanced to parse the time
        glucoseLevel: logInfo.glucoseLevel,
        food: logInfo.food || "",
        mealContext: logInfo.mealContext || "after",
        notes: `${logInfo.notes || ""} Time: ${timeInfo}`
      };
      
      console.log("Creating new glucose log with time info:", newLog);
      addLog(newLog);
      
      setLogCreated(true);
      pendingLogRef.current = null;
      
      toast({
        title: "Log Added",
        description: `Glucose reading of ${logInfo.glucoseLevel} mg/dL added.`,
        duration: 3000
      });
      
      const confirmationMessage = `Added ${logInfo.glucoseLevel} mg/dL to logs. Time noted.`;
      
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
        await playResponseAudio(confirmationMessage);
      }
      
      return;
    }
    
    await originalHandleSpeechResult(text);
  };

  // When a log is created, offer to navigate to logs page
  useEffect(() => {
    if (logCreated) {
      setTimeout(() => {
        const viewLogsMessage = "Would you like to view your logs?";
        
        setMessages(prev => [
          ...prev,
          {
            text: viewLogsMessage,
            type: 'assistant',
            timestamp: Date.now(),
            isNew: true
          }
        ]);
        
        if (mode === 'voice' && playResponseAudio) {
          playResponseAudio(viewLogsMessage);
        }
        
        setLogCreated(false);
      }, 1000);
    }
  }, [logCreated, setMessages, mode, playResponseAudio]);
  
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          text: "Hi! I'm your Glucose Buddy. How can I help?",
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

  // Handle view logs response
  const processMessage = (text: string) => {
    if (text.toLowerCase().includes("yes") && 
        messages[messages.length - 1]?.text.includes("view your logs")) {
      setTimeout(() => {
        navigate('/logs');
      }, 500);
    }
    return handleUserMessage(text);
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
