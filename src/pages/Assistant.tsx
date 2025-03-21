
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from '../components/Layout';
import VoiceButton from '../components/VoiceButton';
import MessageList from '../components/assistant/MessageList';
import MessageInput from '../components/assistant/MessageInput';
import { useAssistant, TIME_GROUPS } from '../hooks/assistant/useAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import VoiceSubtitles from '@/components/voice/VoiceSubtitles';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppHeader from '@/components/AppHeader';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Assistant = () => {
  const {
    mode,
    messages,
    input,
    isLoading,
    showWelcome,
    showScrollButton,
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
    setShowScrollButton,
    isPlayingResponse
  } = useAssistant();

  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string | null>(null);
  const [fromAddLog, setFromAddLog] = useState(false);
  const [schedulingIntent, setSchedulingIntent] = useState(false);

  // Check if we came from the add-log page and check for scheduling intent
  useEffect(() => {
    if (location.state) {
      if (location.state.from === 'add-log') {
        setFromAddLog(true);
      }
      
      if (location.state.intent === 'schedule') {
        setSchedulingIntent(true);
        // Automatically switch to voice mode for scheduling
        handleVoiceMode();
      }
    }
  }, [location, handleVoiceMode]);

  // If coming with scheduling intent, automatically start the voice session
  // and prompt the user for scheduling information
  useEffect(() => {
    if (schedulingIntent && mode === 'voice' && !isLoading) {
      // Add a small delay to let the UI render before starting the session
      const timer = setTimeout(() => {
        handleStartSession();
        // Pre-fill with scheduling message to guide the assistant
        handleInputChange("I'd like to schedule a glucose logging reminder");
        handleSend();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [schedulingIntent, mode, isLoading, handleStartSession, handleInputChange, handleSend]);

  // Create a custom event for message updates
  React.useEffect(() => {
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
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.type === 'user' && !lastUserMessage) {
          setLastUserMessage(msg.text);
        }
        if (msg.type === 'assistant' && !lastAssistantMessage) {
          setLastAssistantMessage(msg.text);
        }
        if (lastUserMessage && lastAssistantMessage) break;
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

  const handleBackToLog = () => {
    navigate('/add-log');
  };

  return (
    <Layout>
      <AppHeader />
      <div className={`mx-auto h-full flex flex-col ${isMobile ? 'w-full' : 'max-w-3xl'}`}>
        {/* Back Button (when coming from Add Log) */}
        {fromAddLog && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-16 left-4 z-20 flex items-center gap-1 text-gray-600"
            onClick={handleBackToLog}
          >
            <ArrowLeft size={16} />
            <span>Back to Log</span>
          </Button>
        )}

        <AnimatePresence mode="wait">
          {mode === 'voice' ? (
            <motion.div
              key="voice-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full w-full mx-auto max-w-md mt-[-5vh]"
            >
              <VoiceButton 
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
                onTextMode={handleTextMode}
                onSpeechResult={handleSpeechResult}
                isPlayingResponse={isPlayingResponse}
                isLoading={isLoading}
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
              <ScrollArea className="flex-1 pb-20">
                <MessageList 
                  messages={messages}
                  isLoading={isLoading}
                  showWelcome={showWelcome}
                  showScrollButton={showScrollButton}
                  timeGroups={TIME_GROUPS}
                  onDismissWelcome={handleDismissWelcome}
                  onScrollToBottom={scrollToBottom}
                />
              </ScrollArea>
              
              <div className="fixed bottom-0 left-0 right-0 z-20 bg-white pb-[6.5rem] pt-2 border-t border-gray-100">
                <div className={isMobile ? "w-full px-2" : "max-w-3xl mx-auto px-2"}>
                  <MessageInput 
                    input={input}
                    isLoading={isLoading || isPlayingResponse}
                    onInputChange={handleInputChange}
                    onSend={handleSend}
                    onSuggestionSelect={handleSuggestionSelect}
                    onVoiceMode={handleVoiceMode}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Assistant;
