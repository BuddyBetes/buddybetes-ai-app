
import { useState, useRef } from 'react';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { extractGlucoseInfo, isGlucoseLogIntent } from '@/utils/voiceParser';

export const useGlucoseLogging = (setMessages: React.Dispatch<React.SetStateAction<any[]>>, playResponseAudio: ((text: string) => Promise<void>) | undefined, mode: 'voice' | 'text') => {
  const { addLog } = useLogContext();
  const { toast } = useToast();
  const [logCreated, setLogCreated] = useState(false);
  const navigate = useNavigate();
  const [askForTime, setAskForTime] = useState(false);
  const pendingLogRef = useRef<any>(null);

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
        
        return true;
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
      
      return true;
    }
    
    return false;
  };

  // Process a message that might follow log creation
  const processViewLogsNavigation = (text: string): boolean => {
    if (text.toLowerCase().includes("yes") && text.length < 10) {
      setTimeout(() => {
        navigate('/logs');
      }, 500);
      return true;
    }
    return false;
  };

  // Handle offering to view logs after creating a log
  const handleLogCreated = async () => {
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
  };

  return {
    logCreated,
    askForTime,
    processGlucoseLogIntent,
    processViewLogsNavigation,
    handleLogCreated
  };
};
