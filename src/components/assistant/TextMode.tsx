
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Message } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface TextModeProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  showWelcome: boolean;
  showScrollButton: boolean;
  timeGroups: Record<string, string>;
  isPlayingResponse: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onDismissWelcome: () => void;
  onScrollToBottom: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSuggestionSelect: (suggestion: string) => void;
  onVoiceMode: () => void;
}

const TextMode: React.FC<TextModeProps> = ({
  messages,
  input,
  isLoading,
  showWelcome,
  showScrollButton,
  timeGroups,
  isPlayingResponse,
  messagesEndRef,
  onDismissWelcome,
  onScrollToBottom,
  onInputChange,
  onSend,
  onSuggestionSelect,
  onVoiceMode
}) => {
  const isMobile = useIsMobile();
  const [isPwa, setIsPwa] = useState(false);
  
  // Detect if running as PWA
  useEffect(() => {
    // Check if the app is running in standalone mode (PWA)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone === true;
    setIsPwa(isInStandaloneMode);
  }, []);
  
  return (
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
          timeGroups={timeGroups}
          onDismissWelcome={onDismissWelcome}
          onScrollToBottom={onScrollToBottom}
        />
      </ScrollArea>
      
      <div className={`fixed bottom-0 left-0 right-0 z-20 bg-white pt-2 border-t border-gray-100 ${isPwa ? 'pb-28' : 'pb-20'}`}>
        <div className={isMobile ? "w-full px-2" : "max-w-3xl mx-auto px-2"}>
          <MessageInput 
            input={input}
            isLoading={isLoading || isPlayingResponse}
            onInputChange={onInputChange}
            onSend={onSend}
            onSuggestionSelect={onSuggestionSelect}
            onVoiceMode={onVoiceMode}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TextMode;
