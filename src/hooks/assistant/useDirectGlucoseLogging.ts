
import { parseVoiceInput } from '@/services/voiceParsingService';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types';

export const useDirectGlucoseLogging = () => {
  const { addLog } = useLogContext();
  const { toast } = useToast();

  const processGlucoseLog = async (
    message: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    playResponseAudio: ((text: string) => Promise<void>) | undefined,
    currentMode: 'voice' | 'text',
    saveMessageToSupabase: (message: Message, conversationId: string) => Promise<void>,
    conversationId: string | null
  ): Promise<boolean> => {
    // Use AI parsing service instead of regex
    const parsedData = await parseVoiceInput(message);
    console.log("AI parsing result for direct glucose logging:", parsedData);
    
    if (parsedData.error) {
      console.error("Error from parsing service:", parsedData.error);
      return false;
    }
    
    // First check if it's a food log intent according to AI
    if (parsedData.isFoodLog && parsedData.food) {
      const newUserMessage: Message = { 
        text: message, 
        type: 'user',
        timestamp: Date.now(),
        isNew: true
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      
      if (conversationId) {
        await saveMessageToSupabase(newUserMessage, conversationId);
      }
      
      try {
        await addLog({
          timestamp: new Date(),
          glucoseLevel: parsedData.glucoseLevel || undefined, // Allow including glucose level in food entries
          food: parsedData.food,
          mealContext: parsedData.mealContext || "after",
          notes: parsedData.notes || ""
        });
        
        const confirmMessage = `Added food entry: ${parsedData.food}${
          parsedData.glucoseLevel ? ` with glucose reading of ${parsedData.glucoseLevel} mg/dL.` : '.'
        }`;
        
        const assistantMessage: Message = { 
          text: confirmMessage, 
          type: 'assistant',
          timestamp: Date.now(),
          isNew: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (conversationId) {
          await saveMessageToSupabase(assistantMessage, conversationId);
        }
        
        if (currentMode === 'voice' && playResponseAudio) {
          await playResponseAudio(confirmMessage);
        }
        
        toast({
          title: "Food Logged",
          description: `Food entry "${parsedData.food}" added successfully.`,
          duration: 3000
        });
        
        return true;
      } catch (error) {
        console.error("Error adding food log:", error);
        return false;
      }
    }
    // Then check if it's a glucose log intent (secondary priority)
    else if (parsedData.isGlucoseLog && parsedData.glucoseLevel) {
      const newUserMessage: Message = { 
        text: message, 
        type: 'user',
        timestamp: Date.now(),
        isNew: true
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      
      if (conversationId) {
        await saveMessageToSupabase(newUserMessage, conversationId);
      }
      
      try {
        // Ask for food if no food is provided with glucose level
        if (!parsedData.food) {
          const askForFoodMessage: Message = {
            text: `I've detected a glucose reading of ${parsedData.glucoseLevel} mg/dL. What food did you eat with this reading?`,
            type: 'assistant',
            timestamp: Date.now(),
            isNew: true
          };
          
          setMessages(prev => [...prev, askForFoodMessage]);
          
          if (conversationId) {
            await saveMessageToSupabase(askForFoodMessage, conversationId);
          }
          
          if (currentMode === 'voice' && playResponseAudio) {
            await playResponseAudio(askForFoodMessage.text);
          }
          
          return true;
        }
        
        await addLog({
          timestamp: new Date(),
          glucoseLevel: parsedData.glucoseLevel,
          food: parsedData.food || "",
          mealContext: parsedData.mealContext || "after",
          notes: parsedData.notes || ""
        });
        
        const confirmMessage = `Added ${parsedData.glucoseLevel} mg/dL to your log.${
          parsedData.mealContext ? ` Context: ${parsedData.mealContext} meal.` : ''
        }${
          parsedData.food ? ` Food: ${parsedData.food}.` : ''
        }`;
        
        const assistantMessage: Message = { 
          text: confirmMessage, 
          type: 'assistant',
          timestamp: Date.now(),
          isNew: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (conversationId) {
          await saveMessageToSupabase(assistantMessage, conversationId);
        }
        
        if (currentMode === 'voice' && playResponseAudio) {
          await playResponseAudio(confirmMessage);
        }
        
        toast({
          title: "Log Added",
          description: `Glucose reading of ${parsedData.glucoseLevel} mg/dL added.`,
          duration: 3000
        });
        
        return true;
      } catch (error) {
        console.error("Error adding glucose log:", error);
        return false;
      }
    }
    
    return false;
  };

  return {
    processGlucoseLog
  };
};
