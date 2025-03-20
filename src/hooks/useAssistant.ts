
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types';
import { detectFoodQuery } from '@/utils/foodDetection';

export const useAssistant = () => {
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { getRecentLogs } = useLogContext();
  const { toast } = useToast();
  
  // Initialize audio element for TTS
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlayingResponse(false);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Check if this is the first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('assistantVisited');
    if (hasVisitedBefore) {
      setShowWelcome(false);
    } else {
      localStorage.setItem('assistantVisited', 'true');
    }
    
    // Add initial system message
    if (messages.length === 0) {
      setMessages([
        {
          text: "Hello! I'm your Glucose Buddy Assistant. How can I help you today?",
          type: 'assistant',
          timestamp: Date.now(),
          isNew: true
        }
      ]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const setShowScrollButtonState = (show: boolean) => {
    setShowScrollButton(show);
  };
  
  const handleStartSession = () => {
    // Preserve messages when switching to voice mode
    console.log('Starting voice session...');
  };
  
  const handleEndSession = () => {
    console.log('Ending voice session...');
  };
  
  const handleTextMode = () => {
    setMode('text');
  };
  
  const handleVoiceMode = () => {
    setMode('voice');
  };
  
  const handleInputChange = (value: string) => {
    setInput(value);
  };
  
  const handleSuggestionSelect = (suggestion: string) => {
    setInput(suggestion);
  };
  
  const handleDismissWelcome = () => {
    setShowWelcome(false);
  };
  
  const handleSpeechResult = async (text: string) => {
    if (!text.trim()) return;
    
    // Process the speech result as a user message
    await handleUserMessage(text);
  };
  
  const handleUserMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
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
        setMessages(prev => [...prev, { 
          text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.", 
          type: 'assistant',
          timestamp: Date.now(),
          isNew: true
        }]);
      } else {
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
        if (mode === 'voice') {
          playResponseAudio(data.response);
        }
      }
    } catch (err) {
      console.error('Error in handleUserMessage:', err);
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I encountered an error. Please try again.", 
        type: 'assistant',
        timestamp: Date.now(),
        isNew: true
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };
  
  const handleSend = () => {
    handleUserMessage(input);
  };
  
  const playResponseAudio = async (text: string) => {
    try {
      setIsPlayingResponse(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: text }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.audioContent && audioRef.current) {
        // Create audio from base64
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        audioRef.current.src = audioSrc;
        
        await audioRef.current.play();
      } else {
        setIsPlayingResponse(false);
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlayingResponse(false);
      toast({
        title: "Audio Playback Error",
        description: "Failed to play audio response",
        variant: "destructive"
      });
    }
  };

  return {
    mode,
    messages,
    input,
    isLoading,
    showWelcome,
    showScrollButton,
    isPlayingResponse,
    messagesEndRef,
    handleStartSession,
    handleEndSession,
    handleTextMode,
    handleVoiceMode,
    handleInputChange,
    handleSuggestionSelect,
    handleDismissWelcome,
    handleSend,
    handleSpeechResult,
    scrollToBottom,
    setShowScrollButtonState
  };
};

export const TIME_GROUPS = {
  NOW: 'Just now',
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  OLDER: 'Older'
};
