
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface VoiceSubtitlesProps {
  userMessage: string | null;
  assistantMessage: string | null;
  isLoading?: boolean;
}

const VoiceSubtitles: React.FC<VoiceSubtitlesProps> = ({ 
  userMessage, 
  assistantMessage,
  isLoading = false
}) => {
  return (
    <div className="w-full max-w-md mx-auto text-center mb-8 mt-4">
      <AnimatePresence>
        {userMessage && !assistantMessage && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-full"
          >
            {userMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex space-x-1 items-center bg-[#35cab4] text-white px-4 py-2 rounded-full"
          >
            <span>Thinking</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block"
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="inline-block"
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="inline-block"
            >
              .
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {assistantMessage && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block bg-[#35cab4] text-white px-4 py-2 rounded-full"
          >
            {assistantMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceSubtitles;
