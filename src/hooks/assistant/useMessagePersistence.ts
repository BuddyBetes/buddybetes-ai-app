
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Message } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const useMessagePersistence = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadConversation = async () => {
      if (!user) return null;
      
      try {
        const { data: conversationData, error: conversationError } = await supabase
          .from('assistant_conversations')
          .select('id, conversation_id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (conversationError) {
          console.error('Error fetching conversation:', conversationError);
          return null;
        }
        
        let currentConversationId: string;
        
        if (conversationData && conversationData.length > 0) {
          currentConversationId = conversationData[0].id;
          setConversationId(currentConversationId);
          
          const { data: messageData, error: messageError } = await supabase
            .from('assistant_messages')
            .select('*')
            .eq('conversation_id', currentConversationId)
            .order('timestamp', { ascending: true });
            
          if (messageError) {
            console.error('Error fetching messages:', messageError);
            return null;
          }
          
          if (messageData && messageData.length > 0) {
            const loadedMessages: Message[] = messageData.map(msg => {
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
              const messageTimestamp = msg.timestamp 
                ? new Date(msg.timestamp).getTime() 
                : Date.now();
              
              return {
                text: msg.content,
                type: msg.message_type as 'user' | 'assistant',
                timestamp: messageTimestamp,
                nutritionalInfo
              };
            });
            
            return loadedMessages;
          } else {
            // No messages found for this conversation, create a welcome message with current timestamp
            const currentTimestamp = Date.now();
            const welcomeMessage: Message = {
              text: "Hi! I'm BuddyBetes. I can help answer questions and log your glucose readings. Just say things like 'log 120' or 'my glucose is 95 after dinner'.",
              type: 'assistant',
              timestamp: currentTimestamp
            };
            
            await saveMessageToSupabase(welcomeMessage, currentConversationId);
            return [welcomeMessage];
          }
        } else {
          // No conversation found, create a new one with current timestamp
          const currentTimestamp = Date.now();
          const newConversationId = `conv-${currentTimestamp}`;
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
            return null;
          }
          
          currentConversationId = newConv.id;
          setConversationId(currentConversationId);
          
          const welcomeMessage: Message = {
            text: "Hi! I'm BuddyBetes. I can help answer questions and log your glucose readings. Just say things like 'log 120' or 'my glucose is 95 after dinner'.",
            type: 'assistant',
            timestamp: currentTimestamp
          };
          
          await saveMessageToSupabase(welcomeMessage, currentConversationId);
          return [welcomeMessage];
        }
      } catch (error) {
        console.error('Error in loadConversation:', error);
        return null;
      }
    };
    
    loadConversation().then(messages => {
      if (messages && messages.length > 0) {
        // This is now handled by the parent component
      }
    });
  }, [user]);
  
  const saveMessageToSupabase = async (message: Message, convId: string) => {
    if (!user || !convId) return;
    
    try {
      // Ensure timestamp is valid before converting to ISO
      const timestamp = message.timestamp 
        ? new Date(message.timestamp).toISOString() 
        : new Date().toISOString();
      
      console.log('Saving message with timestamp:', timestamp);
      console.log('Original message timestamp:', message.timestamp);
      console.log('As date object:', new Date(message.timestamp || Date.now()));
      
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
        timestamp: timestamp
      };
      
      const { error } = await supabase
        .from('assistant_messages')
        .insert(messageData);
        
      if (error) {
        console.error('Error saving message:', error);
      }
      
      // Update the conversation's updated_at timestamp
      await supabase
        .from('assistant_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);
        
    } catch (error) {
      console.error('Error saving message to Supabase:', error);
    }
  };

  return {
    conversationId,
    saveMessageToSupabase,
  };
};
