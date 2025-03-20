
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from '../components/Layout';
import VoiceButton from '../components/VoiceButton';
import MessageList from '../components/assistant/MessageList';
import MessageInput from '../components/assistant/MessageInput';
import { useAssistant, TIME_GROUPS } from '../hooks/assistant/useAssistant';

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
              onSpeechResult={handleSpeechResult}
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
            <MessageList 
              messages={messages}
              isLoading={isLoading}
              showWelcome={showWelcome}
              showScrollButton={showScrollButton}
              timeGroups={TIME_GROUPS}
              onDismissWelcome={handleDismissWelcome}
              onScrollToBottom={scrollToBottom}
            />
            
            <MessageInput 
              input={input}
              isLoading={isLoading || isPlayingResponse}
              onInputChange={handleInputChange}
              onSend={handleSend}
              onSuggestionSelect={handleSuggestionSelect}
              onVoiceMode={handleVoiceMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Assistant;
