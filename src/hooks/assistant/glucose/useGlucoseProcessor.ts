
import { useState, useRef } from 'react';
import { extractGlucoseInfo, isGlucoseLogIntent } from '@/utils/voiceParser';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useGlucoseProcessor = (
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  playResponseAudio: ((text: string) => Promise<void>) | undefined,
  mode: 'voice' | 'text'
) => {
  const { addLog } = useLogContext();
  const { toast } = useToast();
  const [askForTime, setAskForTime] = useState(false);
  const pendingLogRef = useRef<any>(null);
  const navigate = useNavigate();

  // Process voice input for glucose logging
  const processGlucoseLogIntent = async (text: string): Promise<boolean> => {
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
          
          return true;
        }
        
        return await createGlucoseLog(logInfo, text);
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
      try {
        await addLog(newLog);
        
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
        
        return true;
      } catch (error) {
        console.error("Error adding glucose log:", error);
        const errorMessage = "I had trouble adding your log. Please try again.";
        
        setMessages(prev => [
          ...prev,
          {
            text: text,
            type: 'user',
            timestamp: Date.now(),
            isNew: true
          },
          {
            text: errorMessage,
            type: 'assistant',
            timestamp: Date.now(),
            isNew: true
          }
        ]);
        
        if (mode === 'voice' && playResponseAudio) {
          await playResponseAudio(errorMessage);
        }
        
        return true;
      }
    }
    
    return false;
  };

  // Create glucose log from extracted information
  const createGlucoseLog = async (logInfo: any, text: string): Promise<boolean> => {
    const newLog = {
      timestamp: new Date(),
      glucoseLevel: logInfo.glucoseLevel,
      food: logInfo.food || "",
      mealContext: logInfo.mealContext || "after",
      notes: logInfo.notes || ""
    };
    
    console.log("Creating new glucose log:", newLog);
    try {
      await addLog(newLog);
      
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
      
      return true;
    } catch (error) {
      console.error("Error adding glucose log:", error);
      const errorMessage = "I encountered an issue while adding your log. Please try again.";
      
      setMessages(prev => [
        ...prev,
        {
          text: text,
          type: 'user',
          timestamp: Date.now(),
          isNew: true
        },
        {
          text: errorMessage,
          type: 'assistant',
          timestamp: Date.now(),
          isNew: true
        }
      ]);
      
      if (mode === 'voice' && playResponseAudio) {
        await playResponseAudio(errorMessage);
      }
      
      return true;
    }
  };

  return {
    askForTime,
    processGlucoseLogIntent
  };
};
