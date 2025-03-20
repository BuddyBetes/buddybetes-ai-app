
import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle, Volume2 } from 'lucide-react';
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
          placeholder={isLoading ? "Assistant is responding..." : "Ask your health assistant..."}
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
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5"
                >
                  <svg className="w-full h-full text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </motion.div>
              ) : "Send"}
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
          <Volume2 size={16} className="text-buddy-500" />
          Switch to Voice Mode
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
