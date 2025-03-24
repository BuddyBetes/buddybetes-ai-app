
import { supabase } from "@/integrations/supabase/client";
import { useLogContext } from '@/context/LogContext';
import { Message, NutritionalInfo } from '@/types';
import { detectFoodQuery } from '@/utils/foodDetection';
import { useToast } from '@/hooks/use-toast';

export const useAssistantResponse = () => {
  const { getRecentLogs } = useLogContext();
  const { toast } = useToast();

  const requestAssistantResponse = async (
    message: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    playResponseAudio: ((text: string) => Promise<void>) | undefined,
    currentMode: 'voice' | 'text',
    saveMessageToSupabase: (message: Message, conversationId: string) => Promise<void>,
    conversationId: string | null
  ): Promise<void> => {
    try {
      const recentLogs = getRecentLogs(5);
      const foodQuery = detectFoodQuery(message);
      
      // Check if this is a request for statistics
      const showStats = message.toLowerCase().includes('average') ||
                        message.toLowerCase().includes('min') ||
                        message.toLowerCase().includes('max') ||
                        message.toLowerCase().includes('range') ||
                        message.toLowerCase().includes('summary') ||
                        message.toLowerCase().includes('statistics') ||
                        message.toLowerCase().includes('stats');
      
      // Check if this is a request for trend analysis
      const analyzeTrends = message.toLowerCase().includes('trend') || 
                           message.toLowerCase().includes('analyze') ||
                           message.toLowerCase().includes('pattern') ||
                           message.toLowerCase().includes('history');
      
      console.log("📤 Sending to glucose-assistant function with message:", message);
      console.log("Show stats:", showStats);
      console.log("Analyze trends:", analyzeTrends);
      
      const { data, error } = await supabase.functions.invoke('glucose-assistant', {
        body: { 
          message: message,
          glucoseHistory: recentLogs,
          foodQuery: foodQuery,
          makeBrief: true,
          analyzeTrends: analyzeTrends,
          showStats: showStats
        }
      });
      
      if (error) {
        console.error('❌ Error calling assistant function:', error);
        toast({
          title: "Error",
          description: "Connection problem. Please try again.",
          variant: "destructive"
        });
        
        const errorMessage = "Sorry, having trouble connecting. Try again soon.";
        const assistantErrorMsg: Message = { 
          text: errorMessage, 
          type: 'assistant',
          timestamp: Date.now(),
          isNew: true
        };
        
        setMessages(prev => [...prev, assistantErrorMsg]);
        
        if (conversationId) {
          await saveMessageToSupabase(assistantErrorMsg, conversationId);
        }
        
        if (currentMode === 'voice' && playResponseAudio) {
          console.log("Playing error message as audio");
          try {
            await playResponseAudio(errorMessage);
          } catch (playbackError) {
            console.error("Error playing error message:", playbackError);
          }
        }
      } else {
        console.log("📥 Received response from glucose-assistant!");
        console.log("🗣️ ASSISTANT RESPONSE:", data.response);
        console.log("📊 STATS:", data.stats);
        console.log("📈 TREND ANALYSIS:", data.trendAnalysis);
        
        // Only include stats if they were requested
        const stats = showStats ? (data.stats || undefined) : undefined;
        
        const assistantMessage: Message = { 
          text: data.response, 
          type: 'assistant',
          nutritionalInfo: data.nutritionalInfo || undefined,
          stats: stats,
          trendAnalysis: data.trendAnalysis || undefined,
          timestamp: Date.now(),
          isNew: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (conversationId) {
          await saveMessageToSupabase(assistantMessage, conversationId);
        }
        
        if (currentMode === 'voice' && playResponseAudio) {
          console.log("🔊 In voice mode, playing TTS response");
          try {
            await playResponseAudio(data.response);
          } catch (playbackError) {
            console.error("❌ Error playing response audio:", playbackError);
            toast({
              title: "Audio Error",
              description: "Could not play response audio.",
              variant: "destructive"
            });
          }
        }
      }
    } catch (err) {
      console.error('❌ Error in requesting assistant response:', err);
      const fallbackMessage = "Sorry, I encountered an error. Please try again.";
      const errorMsg: Message = { 
        text: fallbackMessage, 
        type: 'assistant',
        timestamp: Date.now(),
        isNew: true
      };
      
      setMessages(prev => [...prev, errorMsg]);
      
      if (conversationId) {
        await saveMessageToSupabase(errorMsg, conversationId);
      }
      
      if (currentMode === 'voice' && playResponseAudio) {
        try {
          await playResponseAudio(fallbackMessage);
        } catch (playbackError) {
          console.error("Error playing fallback message:", playbackError);
        }
      }
    }
  };

  return {
    requestAssistantResponse
  };
};
