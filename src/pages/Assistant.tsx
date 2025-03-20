
import React, { useState } from 'react';
import Layout from '../components/Layout';
import VoiceButton from '../components/VoiceButton';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const Assistant = () => {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [messages, setMessages] = useState<Array<{text: string, type: 'user' | 'assistant'}>>([]);
  const [input, setInput] = useState('');
  
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
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages([...messages, { text: input, type: 'user' }]);
    
    // Simulate AI response
    setTimeout(() => {
      let response;
      if (input.toLowerCase().includes('glucose')) {
        response = "Based on your recent logs, your glucose levels have been within the target range. Great job managing your blood sugar!";
      } else if (input.toLowerCase().includes('food') || input.toLowerCase().includes('eat')) {
        response = "I recommend balanced meals with protein, healthy fats, and complex carbohydrates to help maintain stable glucose levels. Would you like some meal suggestions?";
      } else {
        response = "I'm your glucose buddy assistant! I can help you track glucose levels, suggest meal options, and provide insights about your health data. What would you like to know?";
      }
      
      setMessages(prev => [...prev, { text: response, type: 'assistant' }]);
    }, 1000);
    
    setInput('');
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
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Ask me anything about your glucose, diet, or health!</p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                </motion.div>
              ))}
            </div>
            
            <div className="sticky bottom-0 bg-white pb-4">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your health assistant..."
                  className="resize-none"
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
