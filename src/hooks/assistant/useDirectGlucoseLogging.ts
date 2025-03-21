
import { isGlucoseLogIntent, extractGlucoseInfo } from '@/utils/voiceParser';
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
    // Check if the message is a glucose log intent
    const isGlucoseLog = isGlucoseLogIntent(message);
    
    if (isGlucoseLog) {
      const logInfo = extractGlucoseInfo(message);
      
      if (logInfo && logInfo.glucoseLevel) {
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
            glucoseLevel: logInfo.glucoseLevel,
            food: logInfo.food || "",
            mealContext: logInfo.mealContext || "after",
            notes: logInfo.notes || ""
          });
          
          const confirmMessage = `Added ${logInfo.glucoseLevel} mg/dL to your log.${
            logInfo.mealContext ? ` Context: ${logInfo.mealContext} meal.` : ''
          }${
            logInfo.food ? ` Food: ${logInfo.food}.` : ''
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
            description: `Glucose reading of ${logInfo.glucoseLevel} mg/dL added.`,
            duration: 3000
          });
          
          return true;
        } catch (error) {
          console.error("Error adding glucose log:", error);
          return false;
        }
      }
    }
    
    return false;
  };

  return {
    processGlucoseLog
  };
};
