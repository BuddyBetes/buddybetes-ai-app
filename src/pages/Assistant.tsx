
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { useAssistant, TIME_GROUPS } from '../hooks/assistant/useAssistant';
import { useAssistantNavigation } from '@/hooks/assistant/useAssistantNavigation';
import { useSchedulingIntent } from '@/hooks/assistant/useSchedulingIntent';
import { useMessageTracking } from '@/hooks/assistant/useMessageTracking';
import AppHeader from '@/components/AppHeader';
import VoiceMode from '@/components/assistant/VoiceMode';
import TextMode from '@/components/assistant/TextMode';
import BackToLogButton from '@/components/assistant/BackToLogButton';

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

  const { fromAddLog, schedulingIntent } = useAssistantNavigation();
  
  useSchedulingIntent(
    schedulingIntent,
    mode,
    isLoading,
    handleStartSession,
    handleInputChange,
    handleSend,
    handleVoiceMode
  );
  
  useMessageTracking(messages, mode);

  // Detect if running as PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
               (window.navigator as any).standalone === true;

  return (
    <Layout>
      <AppHeader />
      <div className={`mx-auto h-full flex flex-col w-full max-w-3xl ${isPWA ? 'pb-safe-bottom' : ''}`}>
        {/* Back Button (when coming from Add Log) */}
        <BackToLogButton visible={fromAddLog} />

        <AnimatePresence mode="wait">
          {mode === 'voice' ? (
            <VoiceMode
              handleStartSession={handleStartSession}
              handleEndSession={handleEndSession}
              handleTextMode={handleTextMode}
              handleSpeechResult={handleSpeechResult}
              isPlayingResponse={isPlayingResponse}
              isLoading={isLoading}
            />
          ) : (
            <TextMode
              messages={messages}
              input={input}
              isLoading={isLoading}
              showWelcome={showWelcome}
              showScrollButton={showScrollButton}
              timeGroups={TIME_GROUPS}
              isPlayingResponse={isPlayingResponse}
              messagesEndRef={messagesEndRef}
              onDismissWelcome={handleDismissWelcome}
              onScrollToBottom={scrollToBottom}
              onInputChange={handleInputChange}
              onSend={handleSend}
              onSuggestionSelect={handleSuggestionSelect}
              onVoiceMode={handleVoiceMode}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Assistant;
