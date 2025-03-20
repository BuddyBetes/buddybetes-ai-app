
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import VoiceButton from '../components/VoiceButton';
import { MessageSquare, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from "@/integrations/supabase/client";
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/components/ui/use-toast';

interface NutritionalInfo {
  name: string;
  calories: string;
  carbs: string;
  details: string;
}

const Assistant = () => {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [messages, setMessages] = useState<Array<{text: string, type: 'user' | 'assistant', nutritionalInfo?: NutritionalInfo}>>([]);
  const [input, setInput] = useState('');
  const [foodQuery, setFoodQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getRecentLogs } = useLogContext();
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleStartSession = () => {
    // This would normally connect to AI voice service
    console.log('Starting voice session...');
  };
  
  const handleEndSession = () => {
    // This would normally disconnect from AI voice service
    console.log('Ending voice session...');
  };
  
  const handleTextMode = () => {
    setMode('text');
  };
  
  const handleVoiceMode = () => {
    setMode('voice');
  };

  const toggleFoodSearch = () => {
    setShowFoodSearch(!showFoodSearch);
  };
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: input, type: 'user' }]);
    setIsLoading(true);

    try {
      // Get recent glucose logs to provide context
      const recentLogs = getRecentLogs(5);
      
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
          type: 'assistant' 
        }]);
      } else {
        // Add AI response to messages
        setMessages(prev => [...prev, { 
          text: data.response, 
          type: 'assistant',
          nutritionalInfo: data.nutritionalInfo || undefined
        }]);
      }
    } catch (err) {
      console.error('Error in handleSend:', err);
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I encountered an error. Please try again.", 
        type: 'assistant' 
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
      setFoodQuery('');  // Clear food query after sending
      setShowFoodSearch(false);  // Hide food search after sending
    }
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
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-2">
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Ask me anything about your glucose, diet, or health!</p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div key={index} className="space-y-2">
                  <div
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 ${
                        message.type === 'user'
                          ? 'bg-buddy-500 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                  
                  {message.nutritionalInfo && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="ml-3 max-w-[80%] bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <h4 className="text-sm font-semibold text-buddy-700 mb-1">Nutritional Info: {message.nutritionalInfo.name}</h4>
                      <p className="text-xs text-gray-600">{message.nutritionalInfo.details}</p>
                    </motion.div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-xl p-3 bg-gray-100 text-gray-800 rounded-tl-none">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-white pb-4 space-y-2">
              <AnimatePresence>
                {showFoodSearch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 mb-2"
                  >
                    <Input
                      value={foodQuery}
                      onChange={(e) => setFoodQuery(e.target.value)}
                      placeholder="Search for food (e.g., apple, pasta)..."
                      className="resize-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
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
                    className="bg-buddy-500 hover:bg-buddy-600"
                    disabled={isLoading || !input.trim()}
                  >
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFoodSearch}
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
                  <MessageSquare size={16} />
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
