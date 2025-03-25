
import { useState, useRef } from 'react';
import { parseVoiceInput } from '@/services/voiceParsingService';
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

  // Process voice input for glucose logging
  const processGlucoseLogIntent = async (text: string): Promise<boolean> => {
    console.log("Processing voice input with AI parsing...");
    
    try {
      // Use the AI parsing service instead of regex
      const parsedData = await parseVoiceInput(text);
      console.log("AI parsing result:", parsedData);
      
      if (parsedData.error) {
        console.error("Error from parsing service:", parsedData.error);
        return false;
      }
      
      // Handle food logging
      if (parsedData.isFoodLog && parsedData.food) {
        console.log("Food logging intent detected by AI parser!");
        
        // Create a new log with just food information
        const newLog = {
          timestamp: new Date(),
          food: parsedData.food,
          notes: parsedData.notes || "",
          // Set default values for required fields
          glucoseLevel: 0, // Use 0 as a sentinel value for food-only entries
          mealContext: (parsedData.mealContext || "after") as "before" | "after" | "fasting"
        };
        
        console.log("Creating new food log:", newLog);
        await addLog(newLog);
        
        toast({
          title: "Food Logged",
          description: `Food entry "${parsedData.food}" added successfully.`,
          duration: 3000
        });
        
        const confirmationMessage = `Added food entry: ${parsedData.food}`;
        
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
      
      // Handle glucose logging
      if (parsedData.isGlucoseLog && parsedData.glucoseLevel) {
        console.log("Glucose logging intent detected by AI parser!");
        
        // Check if time information is missing
        const timeSpecified = text.includes("now") || 
                             text.includes("just now") || 
                             text.includes("a moment ago") || 
                             text.includes("minutes ago") || 
                             text.includes("hours ago") ||
                             text.match(/at \d{1,2}:\d{2}/i);
        
        if (!timeSpecified) {
          setAskForTime(true);
          pendingLogRef.current = parsedData;
          
          // Ask for time information
          const timeQuestion = `When was this ${parsedData.glucoseLevel} mg/dL reading taken?`;
          
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
        
        return await createGlucoseLog(parsedData, text);
      } else if (askForTime && pendingLogRef.current) {
        // Process time response for pending log
        setAskForTime(false);
        const timeInfo = text;
        const logInfo = pendingLogRef.current;
        
        const newLog = {
          timestamp: new Date(),
          glucoseLevel: logInfo.glucoseLevel,
          food: logInfo.food || "",
          mealContext: (logInfo.mealContext || "after") as "before" | "after" | "fasting",
          notes: `${logInfo.notes || ""} Time: ${timeInfo}`.trim()
        };
        
        console.log("Creating new glucose log with time info:", newLog);
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
      }
    } catch (error) {
      console.error("Error processing voice input:", error);
    }
    
    return false;
  };

  // Create glucose log from extracted information
  const createGlucoseLog = async (parsedData: any, text: string): Promise<boolean> => {
    const newLog = {
      timestamp: new Date(),
      glucoseLevel: parsedData.glucoseLevel,
      food: parsedData.food || "",
      mealContext: (parsedData.mealContext || "after") as "before" | "after" | "fasting",
      notes: parsedData.notes || ""
    };
    
    console.log("Creating new glucose log:", newLog);
    await addLog(newLog);
    
    toast({
      title: "Log Added",
      description: `Glucose reading of ${parsedData.glucoseLevel} mg/dL added.`,
      duration: 3000
    });
    
    const confirmationMessage = `Added ${parsedData.glucoseLevel} mg/dL to logs.${
      parsedData.mealContext ? ` Context: ${parsedData.mealContext} meal.` : ''
    }${
      parsedData.food ? ` Food: ${parsedData.food}.` : ''
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

  return {
    askForTime,
    processGlucoseLogIntent
  };
};
