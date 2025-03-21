
import { useState } from 'react';
import { Message } from '@/types';
import { useMessagePersistence } from './useMessagePersistence';
import { useAssistantResponse } from './useAssistantResponse';
import { useDirectGlucoseLogging } from './useDirectGlucoseLogging';

export const useMessageHandling = (
  playResponseAudio?: (text: string) => Promise<void>,
  currentMode?: 'voice' | 'text'
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  
  const { conversationId, saveMessageToSupabase } = useMessagePersistence();
  const { requestAssistantResponse } = useAssistantResponse();
  const { processGlucoseLog } = useDirectGlucoseLogging();
  
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
