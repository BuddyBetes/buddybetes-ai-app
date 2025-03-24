
import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Message } from '@/types';
import MessageBubble from '../MessageBubble';
import TypingIndicator from '../TypingIndicator';
import WelcomeMessage from '../WelcomeMessage';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  showWelcome: boolean;
  showScrollButton: boolean;
  timeGroups: Record<string, string>;
  onDismissWelcome: () => void;
  onScrollToBottom: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  showWelcome,
  showScrollButton,
  timeGroups,
  onDismissWelcome,
  onScrollToBottom,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Group messages by time
  const groupedMessages = () => {
    const grouped: Record<string, Message[]> = {
      [timeGroups.NOW]: [],
      [timeGroups.TODAY]: [],
      [timeGroups.YESTERDAY]: [],
      [timeGroups.OLDER]: []
    };
    
    const now = new Date();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    messages.forEach(message => {
      const messageDate = new Date(message.timestamp);
      
      if (now.getTime() - messageDate.getTime() < 5 * 60 * 1000) {
        grouped[timeGroups.NOW].push(message);
      } else if (messageDate.getTime() >= today) {
        grouped[timeGroups.TODAY].push(message);
      } else if (messageDate.getTime() >= yesterday.getTime()) {
        grouped[timeGroups.YESTERDAY].push(message);
      } else {
        grouped[timeGroups.OLDER].push(message);
      }
    });
    
    // Filter out empty groups
    return Object.entries(grouped).filter(([_, groupMessages]) => groupMessages.length > 0);
  };
  
  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    
    const handleScroll = () => {
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (!atBottom && messages.length > 2) {
        onScrollToBottom();
      }
    };
    
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [messages.length, onScrollToBottom]);
  
  // Ensure scrolling to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto pb-20 relative px-2 min-h-[300px]"
    >
      <AnimatePresence>
        {showWelcome && (
          <WelcomeMessage onDismiss={onDismissWelcome} />
        )}
      </AnimatePresence>
      
      <div className="space-y-6 pt-4">
        {groupedMessages().map(([timeGroup, groupMessages]) => (
          <div key={timeGroup} className="space-y-6">
            <div className="flex justify-center">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {timeGroup}
              </span>
            </div>
            
            {groupMessages.map((message, index) => (
              <MessageBubble
                key={`${timeGroup}-${index}`}
                text={message.text}
                type={message.type}
                nutritionalInfo={message.nutritionalInfo}
                stats={message.stats}
                trendAnalysis={message.trendAnalysis}
                isNew={message.isNew}
                timestamp={message.timestamp}
              />
            ))}
          </div>
        ))}
      </div>
      
      {isLoading && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
      
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-24 right-4 p-3 bg-[#35cab4] text-white rounded-full shadow-md"
            onClick={onScrollToBottom}
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;
