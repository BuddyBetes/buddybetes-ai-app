
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SuggestionChips from '../SuggestionChips';

interface MessageInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSuggestionSelect: (suggestion: string) => void;
  onVoiceMode: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  input,
  isLoading,
  onInputChange,
  onSend,
  onSuggestionSelect,
  onVoiceMode,
}) => {
  return (
    <div className="sticky bottom-0 bg-white pb-4 space-y-2">
      <SuggestionChips onSelectSuggestion={onSuggestionSelect} />
      
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask your health assistant..."
          className="resize-none"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <div className="flex flex-col gap-2">
          <Button 
            onClick={onSend}
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
          onClick={onVoiceMode}
          className="flex items-center gap-2"
        >
          <MessageCircle size={16} />
          Switch to Voice Mode
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
