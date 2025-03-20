
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import VoiceButton from '../components/VoiceButton';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from "@/integrations/supabase/client";
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/components/ui/use-toast';

const Assistant = () => {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [messages, setMessages] = useState<Array<{text: string, type: 'user' | 'assistant'}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
          glucoseHistory: recentLogs
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
          type: 'assistant' 
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
                <div
                  key={index}
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
            
            <div className="sticky bottom-0 bg-white pb-4">
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
                <Button 
                  onClick={handleSend}
                  className="bg-buddy-500 hover:bg-buddy-600"
                  disabled={isLoading || !input.trim()}
                >
                  Send
                </Button>
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
