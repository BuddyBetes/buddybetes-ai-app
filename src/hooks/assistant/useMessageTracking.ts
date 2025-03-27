
import { useState, useEffect } from 'react';
import { Message } from '@/types';

export const useMessageTracking = (messages: Message[], mode: 'voice' | 'text') => {
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string | null>(null);

  // Create a custom event for message updates
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && mode === 'voice') {
      const messageEvent = new CustomEvent('new-message', { 
        detail: lastMessage 
      });
      window.dispatchEvent(messageEvent);
    }
  }, [messages, mode]);

  // Track last messages for subtitles
  useEffect(() => {
    if (messages.length > 0) {
      // Find last user and assistant messages
      let foundUserMessage = false;
      let foundAssistantMessage = false;
      
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.type === 'user' && !foundUserMessage) {
          setLastUserMessage(msg.text);
          foundUserMessage = true;
        }
        if (msg.type === 'assistant' && !foundAssistantMessage) {
          setLastAssistantMessage(msg.text);
          foundAssistantMessage = true;
        }
        if (foundUserMessage && foundAssistantMessage) break;
      }
    }
  }, [messages]);

  // Reset last messages when changing mode
  useEffect(() => {
    if (mode === 'voice') {
      // Look for the two most recent messages when entering voice mode
      let foundUser = false;
      let foundAssistant = false;
      const userMsg = messages.slice().reverse().find(m => m.type === 'user' && !foundUser && (foundUser = true));
      const assistantMsg = messages.slice().reverse().find(m => m.type === 'assistant' && !foundAssistant && (foundAssistant = true));
      
      setLastUserMessage(userMsg?.text || null);
      setLastAssistantMessage(assistantMsg?.text || null);
    } else {
      setLastUserMessage(null);
      setLastAssistantMessage(null);
    }
  }, [mode, messages]);

  return {
    lastUserMessage,
    lastAssistantMessage
  };
};
