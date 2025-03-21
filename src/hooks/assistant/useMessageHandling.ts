
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';
import { Message, NutritionalInfo } from '@/types';
import { detectFoodQuery } from '@/utils/foodDetection';
import { useAuth } from '@/context/AuthContext';

export const useMessageHandling = (
  playResponseAudio?: (text: string) => Promise<void>,
  currentMode?: 'voice' | 'text'
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { getRecentLogs } = useLogContext();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Load existing conversation or create a new one
  useEffect(() => {
    const loadConversation = async () => {
      if (!user) return;
      
      try {
        // Try to find an existing conversation
        const { data: conversationData, error: conversationError } = await supabase
          .from('assistant_conversations')
          .select('id, conversation_id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (conversationError) {
          console.error('Error fetching conversation:', conversationError);
          return;
        }
        
        let currentConversationId: string;
        
        if (conversationData && conversationData.length > 0) {
          // Use existing conversation
          currentConversationId = conversationData[0].id;
          setConversationId(currentConversationId);
          
          // Load messages for this conversation
          const { data: messageData, error: messageError } = await supabase
            .from('assistant_messages')
            .select('*')
            .eq('conversation_id', currentConversationId)
            .order('timestamp', { ascending: true });
            
          if (messageError) {
            console.error('Error fetching messages:', messageError);
            return;
          }
          
          if (messageData && messageData.length > 0) {
            const loadedMessages: Message[] = messageData.map(msg => {
              // Process the nutritional info properly
              let nutritionalInfo: NutritionalInfo | undefined = undefined;
              if (msg.nutritional_info) {
                const info = msg.nutritional_info as any;
                nutritionalInfo = {
                  name: info.name || '',
                  calories: info.calories || '',
                  carbs: info.carbs || '',
                  details: info.details || ''
                };
              }
              
              return {
                text: msg.content,
                type: msg.message_type as 'user' | 'assistant',
                timestamp: new Date(msg.timestamp).getTime(),
                nutritionalInfo
              };
            });
            
            setMessages(loadedMessages);
          } else {
            // No messages in conversation yet, add a welcome message
            const welcomeMessage: Message = {
              text: "Hi! I'm BuddyBetes. How can I help?",
              type: 'assistant',
              timestamp: Date.now()
            };
            setMessages([welcomeMessage]);
            
            // Save welcome message
            await saveMessageToSupabase(welcomeMessage, currentConversationId);
          }
        } else {
          // Create a new conversation
          const newConversationId = `conv-${Date.now()}`;
          const { data: newConv, error: createError } = await supabase
            .from('assistant_conversations')
            .insert({
              user_id: user.id,
              conversation_id: newConversationId
            })
            .select('id')
            .single();
            
          if (createError) {
            console.error('Error creating conversation:', createError);
            return;
          }
          
          currentConversationId = newConv.id;
          setConversationId(currentConversationId);
          
          // Create welcome message
          const welcomeMessage: Message = {
            text: "Hi! I'm BuddyBetes. How can I help?",
            type: 'assistant',
            timestamp: Date.now()
          };
          setMessages([welcomeMessage]);
          
          // Save welcome message
          await saveMessageToSupabase(welcomeMessage, currentConversationId);
        }
      } catch (error) {
        console.error('Error in loadConversation:', error);
      }
    };
    
    loadConversation();
  }, [user]);
  
  // Function to save a message to Supabase
  const saveMessageToSupabase = async (message: Message, convId: string) => {
    if (!user || !convId) return;
    
    try {
      const messageData = {
        conversation_id: convId,
        message_type: message.type,
        content: message.text,
        nutritional_info: message.nutritionalInfo ? {
          name: message.nutritionalInfo.name,
          calories: message.nutritionalInfo.calories,
          carbs: message.nutritionalInfo.carbs,
          details: message.nutritionalInfo.details
        } : null,
        timestamp: new Date(message.timestamp).toISOString()
      };
      
      const { error } = await supabase
        .from('assistant_messages')
        .insert(messageData);
        
      if (error) {
        console.error('Error saving message:', error);
      }
      
      // Also update the conversation's updated_at timestamp
      await supabase
        .from('assistant_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);
        
    } catch (error) {
      console.error('Error saving message to Supabase:', error);
    }
  };
  
  const handleUserMessage = async (message: string) => {
    if (!message.trim() || isLoading || !user) return;
    
    console.log("🔄 Processing user message:", message);
    console.log(`🎙️ Current mode: ${currentMode || 'text'}`);
    
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
    
    // Save user message if we have a conversation
    if (conversationId) {
      await saveMessageToSupabase(newMessage, conversationId);
    }
    
    try {
      // Get recent glucose logs to provide context
      const recentLogs = getRecentLogs(5);
      
      // Automatically detect food queries
      const foodQuery = detectFoodQuery(message);
      
      console.log("📤 Sending to glucose-assistant function with message:", message);
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('glucose-assistant', {
        body: { 
          message: message,
          glucoseHistory: recentLogs,
          foodQuery: foodQuery,
          makeBrief: true // Tell the assistant to keep responses brief
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
        
        // Save error message
        if (conversationId) {
          await saveMessageToSupabase(assistantErrorMsg, conversationId);
        }
        
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
        console.log("📥 Received response from glucose-assistant!");
        console.log("🗣️ ASSISTANT RESPONSE:", data.response);
        console.log("📊 Full response data:", data);
        console.log("🔄 Processing assistant response...");
        
        // Add AI response to messages
        const assistantMessage: Message = { 
          text: data.response, 
          type: 'assistant',
          nutritionalInfo: data.nutritionalInfo || undefined,
          timestamp: Date.now(),
          isNew: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save assistant message
        if (conversationId) {
          await saveMessageToSupabase(assistantMessage, conversationId);
        }
        
        // If in voice mode, play the response using TTS
        if (currentMode === 'voice' && playResponseAudio) {
          console.log("🔊 In voice mode, playing TTS response");
          try {
            console.log("▶️ Starting audio playback - isLoading will remain true");
            // Ensure isLoading remains true while audio is playing
            await playResponseAudio(data.response);
            console.log("✅ Audio playback completed");
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
      console.error('❌ Error in handleUserMessage:', err);
      const fallbackMessage = "Sorry, I encountered an error. Please try again.";
      const errorMsg: Message = { 
        text: fallbackMessage, 
        type: 'assistant',
        timestamp: Date.now(),
        isNew: true
      };
      
      setMessages(prev => [...prev, errorMsg]);
      
      // Save error message
      if (conversationId) {
        await saveMessageToSupabase(errorMsg, conversationId);
      }
      
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
      console.log("✅ Completing message handling and setting isLoading to false");
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
    console.log("💬 Speech result received:", text);
    if (!text.trim()) {
      console.log("⚠️ Empty speech result, ignoring");
      return;
    }
    
    // Process the speech result as a user message
    console.log("🔄 Processing speech result as user message");
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
