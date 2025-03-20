
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceSubtitlesProps {
  userMessage: string | null;
  assistantMessage: string | null;
}

const VoiceSubtitles: React.FC<VoiceSubtitlesProps> = ({ 
  userMessage, 
  assistantMessage 
}) => {
  // Function to get the first sentence of a message
  const getFirstSentence = (message: string): string => {
    if (!message) return '';
    
    // Split by common sentence delimiters and get the first part
    const sentences = message.split(/(?<=[.!?])\s+/);
    return sentences[0] || message;
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <AnimatePresence>
        {userMessage && !assistantMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-full mt-4 mb-6"
          >
            {getFirstSentence(userMessage)}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {assistantMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block bg-[#35cab4] text-white px-4 py-2 rounded-full mt-4 mb-6"
          >
            {getFirstSentence(assistantMessage)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceSubtitles;
