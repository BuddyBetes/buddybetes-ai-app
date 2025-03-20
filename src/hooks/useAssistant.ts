
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
    console.log("Initializing audio player for TTS");
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      console.log("TTS audio playback finished");
      setIsPlayingResponse(false);
    };
    audioRef.current.onerror = (e) => {
      console.error("TTS audio playback error:", e);
      setIsPlayingResponse(false);
      toast({
        title: "Audio Playback Error",
        description: "Failed to play assistant's response",
        variant: "destructive"
      });
    };
    
    return () => {
      if (audioRef.current) {
        console.log("Cleaning up audio player");
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
    console.log("Starting voice session...");
  };
  
  const handleEndSession = () => {
    console.log("Ending voice session...");
  };
  
  const handleTextMode = () => {
    console.log("Switching to text mode");
    setMode('text');
  };
  
  const handleVoiceMode = () => {
    console.log("Switching to voice mode");
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
    console.log("Speech result received:", text);
    if (!text.trim()) return;
    
    // Process the speech result as a user message
    await handleUserMessage(text);
  };
  
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
        setMessages(prev => [...prev, { 
          text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.", 
          type: 'assistant',
          timestamp: Date.now(),
          isNew: true
        }]);
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
        if (mode === 'voice') {
          console.log("In voice mode, playing TTS response");
          await playResponseAudio(data.response);
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
      console.log("Playing response as audio:", text.substring(0, 50) + "...");
      setIsPlayingResponse(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: text }
      });
      
      if (error) {
        console.error("Text-to-speech error:", error);
        throw new Error(error.message);
      }
      
      if (data.audioContent && audioRef.current) {
        console.log("Received audio content, playing...");
        // Create audio from base64
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        audioRef.current.src = audioSrc;
        
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Audio play error:", error);
              setIsPlayingResponse(false);
              toast({
                title: "Audio Playback Error",
                description: "Browser blocked autoplay. Try again or click to enable audio.",
                variant: "destructive"
              });
            });
          }
        } catch (error) {
          console.error("Audio play method error:", error);
          setIsPlayingResponse(false);
          throw error;
        }
      } else {
        console.log("No audio content received or audio reference is null");
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
