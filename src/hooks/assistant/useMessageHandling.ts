
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types';
import { detectFoodQuery } from '@/utils/foodDetection';

export const useMessageHandling = (
  playResponseAudio?: (text: string) => Promise<void>,
  currentMode?: 'voice' | 'text'
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const { getRecentLogs } = useLogContext();
  const { toast } = useToast();
  
  const handleUserMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    console.log("Processing user message:", message);
    
    // Add sound feedback
    const audio = new Audio('/message-sent.mp3');
    audio.volume = 0.2;
    audio.play().catch(e => console.log('Audio play error:', e));
    
    // Add user message
    const newMessage: Message = { 
      text: message, 
      type: 'user',
      timestamp: Date.now(),
      isNew: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    
    try {
      // Get recent glucose logs to provide context
      const recentLogs = getRecentLogs(5);
      
      // Automatically detect food queries
      const foodQuery = detectFoodQuery(message);
      
      console.log("Calling glucose-assistant function...");
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('glucose-assistant', {
        body: { 
          message: message,
          glucoseHistory: recentLogs,
          foodQuery: foodQuery
        }
      });
      
      if (error) {
        console.error('Error calling assistant function:', error);
        toast({
          title: "Error",
          description: "There was a problem connecting to the assistant. Please try again.",
          variant: "destructive"
        });
        const errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
        setMessages(prev => [...prev, { 
          text: errorMessage, 
          type: 'assistant',
          timestamp: Date.now(),
          isNew: true
        }]);
        
        // Even in error case, if in voice mode, play the error message
        if (currentMode === 'voice' && playResponseAudio) {
          console.log("Playing error message as audio");
          try {
            await playResponseAudio(errorMessage);
          } catch (playbackError) {
            console.error("Error playing error message:", playbackError);
          }
        }
      } else {
        console.log("Received response from glucose-assistant:", data.response.substring(0, 50) + "...");
        // Add AI response to messages
        const assistantMessage: Message = { 
          text: data.response, 
          type: 'assistant',
          nutritionalInfo: data.nutritionalInfo || undefined,
          timestamp: Date.now(),
          isNew: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // If in voice mode, play the response using TTS
        if (currentMode === 'voice' && playResponseAudio) {
          console.log("In voice mode, playing TTS response:", data.response.substring(0, 50) + "...");
          try {
            await playResponseAudio(data.response);
          } catch (playbackError) {
            console.error("Error playing response audio:", playbackError);
            toast({
              title: "Audio Playback Error",
              description: "Could not play the response as audio. Please try again.",
              variant: "destructive"
            });
          }
        }
      }
    } catch (err) {
      console.error('Error in handleUserMessage:', err);
      const fallbackMessage = "I'm sorry, I encountered an error. Please try again.";
      setMessages(prev => [...prev, { 
        text: fallbackMessage, 
        type: 'assistant',
        timestamp: Date.now(),
        isNew: true
      }]);
      
      // Even in error case, if in voice mode, play the fallback message
      if (currentMode === 'voice' && playResponseAudio) {
        console.log("Playing fallback message as audio");
        try {
          await playResponseAudio(fallbackMessage);
        } catch (playbackError) {
          console.error("Error playing fallback message:", playbackError);
        }
      }
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };
  
  const handleInputChange = (value: string) => {
    setInput(value);
  };
  
  const handleSend = () => {
    handleUserMessage(input);
  };
  
  const handleSpeechResult = async (text: string) => {
    console.log("Speech result received:", text);
    if (!text.trim()) return;
    
    // Process the speech result as a user message
    await handleUserMessage(text);
  };
  
  return {
    messages,
    input,
    isLoading,
    handleUserMessage,
    handleInputChange,
    handleSend,
    handleSpeechResult,
    setMessages
  };
};
