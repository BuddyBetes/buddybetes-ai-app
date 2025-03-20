
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from '../components/Layout';
import VoiceButton from '../components/VoiceButton';
import MessageList from '../components/assistant/MessageList';
import MessageInput from '../components/assistant/MessageInput';
import { useAssistant, TIME_GROUPS } from '../hooks/assistant/useAssistant';
import { useIsMobile } from '@/hooks/use-mobile';

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

  const isMobile = useIsMobile();

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

  return (
    <Layout>
      <div className={`mx-auto h-full flex flex-col ${isMobile ? 'w-full' : 'max-w-3xl'}`}>
        <AnimatePresence mode="wait">
          {mode === 'voice' ? (
            <motion.div
              key="voice-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full w-full"
            >
              <VoiceButton 
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
                onTextMode={handleTextMode}
                onSpeechResult={handleSpeechResult}
                isPlayingResponse={isPlayingResponse}
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
              <div className="flex-1 overflow-y-auto">
                <MessageList 
                  messages={messages}
                  isLoading={isLoading}
                  showWelcome={showWelcome}
                  showScrollButton={showScrollButton}
                  timeGroups={TIME_GROUPS}
                  onDismissWelcome={handleDismissWelcome}
                  onScrollToBottom={scrollToBottom}
                />
              </div>
              
              <div className="sticky bottom-0 z-10 bg-white">
                <MessageInput 
                  input={input}
                  isLoading={isLoading || isPlayingResponse}
                  onInputChange={handleInputChange}
                  onSend={handleSend}
                  onSuggestionSelect={handleSuggestionSelect}
                  onVoiceMode={handleVoiceMode}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Assistant;
