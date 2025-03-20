
import React from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, X } from 'lucide-react';
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
    <div className="w-full">
      <SuggestionChips onSelectSuggestion={onSuggestionSelect} />
      
      <div className="flex items-center gap-2 bg-gray-50 rounded-full p-2 border border-gray-200">
        <Button
          type="button"
          variant="ghost" 
          size="icon"
          className="rounded-full text-gray-500 flex-shrink-0"
          onClick={onVoiceMode}
        >
          <Mic size={20} />
        </Button>
        
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={isLoading ? "Assistant is responding..." : "Type your message..."}
          className="resize-none border-none bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 h-10 min-h-10 max-h-32 overflow-y-auto flex-grow"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim()) {
                onSend();
              }
            }
          }}
        />

        {input.trim() ? (
          <Button 
            onClick={onSend}
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#35cab4] text-white hover:bg-[#29A493] flex-shrink-0"
            disabled={isLoading || !input.trim()}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </motion.div>
              ) : (
                <Send size={18} />
              )}
            </motion.div>
          </Button>
        ) : (
          input ? (
            <Button 
              onClick={() => onInputChange('')}
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-500 flex-shrink-0"
            >
              <X size={18} />
            </Button>
          ) : null
        )}
      </div>
    </div>
  );
};

export default MessageInput;
