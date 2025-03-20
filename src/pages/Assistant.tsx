
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, Search, MessageCircle, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from "@/integrations/supabase/client";
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '../components/Layout';
import VoiceButton from '../components/VoiceButton';
import SuggestionChips from '../components/SuggestionChips';
import WelcomeMessage from '../components/WelcomeMessage';
import TypingIndicator from '../components/TypingIndicator';
import MessageBubble from '../components/MessageBubble';
import { Message } from '@/types';

const TIME_GROUPS = {
  NOW: 'Just now',
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  OLDER: 'Older'
};

const Assistant = () => {
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { getRecentLogs } = useLogContext();
  const { toast } = useToast();
  
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
  
  // Automatically detect food queries from the input
  const detectFoodQuery = (input: string): string | null => {
    const foodKeywords = [
      'food', 'eat', 'eating', 'meal', 'snack', 'breakfast', 'lunch', 'dinner',
      'fruit', 'vegetable', 'carbs', 'protein', 'fat', 'diet', 'nutrition',
      'apple', 'banana', 'rice', 'pasta', 'bread', 'meat', 'chicken', 'beef',
      'pork', 'fish', 'dairy', 'cheese', 'yogurt', 'milk'
    ];
    
    const words = input.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (foodKeywords.includes(word)) {
        // Extract potential food items
        const foodRegex = /(?:can I eat|about|is|are|have|eating|food|nutrition info on|carbs in|calories in|about)\s+([a-zA-Z\s]+)(?:\?|$)/i;
        const match = input.match(foodRegex);
        if (match && match[1]) {
          return match[1].trim();
        }
        return null;
      }
    }
    
    return null;
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    
    const handleScroll = () => {
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setShowScrollButton(!atBottom);
    };
    
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);
  
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
  
  const handleSuggestionSelect = (suggestion: string) => {
    setInput(suggestion);
  };
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add sound feedback
    const audio = new Audio('/message-sent.mp3');
    audio.volume = 0.2;
    audio.play().catch(e => console.log('Audio play error:', e));
    
    // Add user message
    const newMessage: Message = { 
      text: input, 
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
      const foodQuery = detectFoodQuery(input);
      
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('glucose-assistant', {
        body: { 
          message: input,
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
        setMessages(prev => [...prev, { 
          text: data.response, 
          type: 'assistant',
          nutritionalInfo: data.nutritionalInfo || undefined,
          timestamp: Date.now(),
          isNew: true
        }]);
      }
    } catch (err) {
      console.error('Error in handleSend:', err);
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
  
  // Group messages by time
  const groupedMessages = () => {
    const grouped: Record<string, Message[]> = {
      [TIME_GROUPS.NOW]: [],
      [TIME_GROUPS.TODAY]: [],
      [TIME_GROUPS.YESTERDAY]: [],
      [TIME_GROUPS.OLDER]: []
    };
    
    const now = new Date();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    messages.forEach(message => {
      const messageDate = new Date(message.timestamp);
      
      if (now.getTime() - messageDate.getTime() < 5 * 60 * 1000) {
        grouped[TIME_GROUPS.NOW].push(message);
      } else if (messageDate.getTime() >= today) {
        grouped[TIME_GROUPS.TODAY].push(message);
      } else if (messageDate.getTime() >= yesterday.getTime()) {
        grouped[TIME_GROUPS.YESTERDAY].push(message);
      } else {
        grouped[TIME_GROUPS.OLDER].push(message);
      }
    });
    
    return grouped;
  };

  return (
    <Layout title="Glucose Buddy Assistant">
      <AnimatePresence mode="wait">
        {mode === 'voice' ? (
          <motion.div
            key="voice-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full"
          >
            <VoiceButton 
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              onTextMode={handleTextMode}
            />
          </motion.div>
        ) : (
          <motion.div
            key="text-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto mb-4 space-y-6 pb-2 relative"
            >
              <AnimatePresence>
                {showWelcome && (
                  <WelcomeMessage onDismiss={() => setShowWelcome(false)} />
                )}
              </AnimatePresence>
              
              {Object.entries(groupedMessages()).map(([timeGroup, groupMessages]) => (
                groupMessages.length > 0 && (
                  <div key={timeGroup} className="space-y-4">
                    <div className="flex justify-center">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {timeGroup}
                      </span>
                    </div>
                    
                    {groupMessages.map((message, index) => (
                      <MessageBubble
                        key={`${timeGroup}-${index}`}
                        text={message.text}
                        type={message.type}
                        nutritionalInfo={message.nutritionalInfo}
                        isNew={message.isNew}
                      />
                    ))}
                  </div>
                )
              ))}
              
              {isLoading && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
              
              <AnimatePresence>
                {showScrollButton && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-2 right-2 p-2 bg-buddy-500 text-white rounded-full shadow-md"
                    onClick={scrollToBottom}
                  >
                    <ArrowDown size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
            <div className="sticky bottom-0 bg-white pb-4 space-y-2">
              <SuggestionChips onSelectSuggestion={handleSuggestionSelect} />
              
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your health assistant..."
                  className="resize-none"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleSend}
                    className="bg-buddy-500 hover:bg-buddy-600 transition-all duration-200"
                    disabled={isLoading || !input.trim()}
                  >
                    <motion.span
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.1 }}
                    >
                      Send
                    </motion.span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-buddy-300"
                  >
                    <Search size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={handleVoiceMode}
                  className="flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  Switch to Voice Mode
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Assistant;
