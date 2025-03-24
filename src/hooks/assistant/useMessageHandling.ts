import { useState, useEffect } from 'react';
import { Message } from '@/types';
import { useMessagePersistence } from './useMessagePersistence';
import { useAssistantResponse } from './useAssistantResponse';
import { useDirectGlucoseLogging } from './useDirectGlucoseLogging';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useMessageHandling = (
  playResponseAudio?: (text: string) => Promise<void>,
  currentMode?: 'voice' | 'text'
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { user } = useAuth();
  const { conversationId, saveMessageToSupabase } = useMessagePersistence();
  const { requestAssistantResponse } = useAssistantResponse();
  const { processGlucoseLog } = useDirectGlucoseLogging();
  
  // Load past messages
  useEffect(() => {
    if (user && conversationId && !isInitialized) {
      const loadMessages = async () => {
        try {
          const { data, error } = await supabase
            .from('assistant_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('timestamp', { ascending: true });
            
          if (error) {
            console.error('Error loading messages:', error);
            return;
          }
          
          if (data && data.length > 0) {
            const loadedMessages: Message[] = data.map(msg => {
              let nutritionalInfo = undefined;
              if (msg.nutritional_info) {
                const info = msg.nutritional_info as any;
                nutritionalInfo = {
                  name: info.name || '',
                  calories: info.calories || '',
                  carbs: info.carbs || '',
                  details: info.details || ''
                };
              }
              
              // Ensure we always have a valid timestamp - fallback to current time if missing
              const timestamp = msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now();
              
              return {
                text: msg.content,
                type: msg.message_type as 'user' | 'assistant',
                timestamp,
                nutritionalInfo
              };
            });
            
            setMessages(loadedMessages);
            setIsInitialized(true);
          } else if (!isInitialized) {
            // If no messages, add welcome message with current timestamp
            const currentTimestamp = Date.now();
            const welcomeMessage: Message = {
              text: "Hi! I'm BuddyBetes. I can help answer questions and log your glucose readings. Just say things like 'log 120' or 'my glucose is 95 after dinner'.",
              type: 'assistant',
              timestamp: currentTimestamp
            };
            setMessages([welcomeMessage]);
            
            if (conversationId) {
              await saveMessageToSupabase(welcomeMessage, conversationId);
            }
            
            setIsInitialized(true);
          }
        } catch (error) {
          console.error('Error loading conversation:', error);
        }
      };
      
      loadMessages();
    }
  }, [user, conversationId, isInitialized]);
  
  const handleUserMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    console.log("🔄 Processing user message:", message);
    console.log(`🎙️ Current mode: ${currentMode || 'text'}`);
    
    const audio = new Audio('/message-sent.mp3');
    audio.volume = 0.2;
    audio.play().catch(e => console.log('Audio play error:', e));
    
    // Try to process as a glucose log first
    const isGlucoseLog = await processGlucoseLog(
      message, 
      setMessages, 
      playResponseAudio, 
      currentMode || 'text',
      saveMessageToSupabase, 
      conversationId
    );
    
    // If it's not a glucose log, process as a regular message
    if (!isGlucoseLog) {
      const newMessage: Message = { 
        text: message, 
        type: 'user',
        timestamp: Date.now(),
        isNew: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsLoading(true);
      
      if (conversationId) {
        await saveMessageToSupabase(newMessage, conversationId);
      }
      
      try {
        await requestAssistantResponse(
          message, 
          setMessages, 
          playResponseAudio, 
          currentMode || 'text',
          saveMessageToSupabase,
          conversationId
        );
      } finally {
        console.log("✅ Completing message handling and setting isLoading to false");
        setIsLoading(false);
        setInput('');
      }
    } else {
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
