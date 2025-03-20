
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
  return (
    <div className="w-full max-w-md mx-auto mb-6 px-4 space-y-3">
      <AnimatePresence>
        {userMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-100 text-gray-800 p-3 rounded-xl rounded-tr-none ml-auto max-w-[80%] relative"
          >
            <div className="text-sm">{userMessage}</div>
            <div className="absolute right-0 top-0 w-2 h-2 transform translate-x-2 -translate-y-1/2 bg-gray-100 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {assistantMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-[#35cab4] text-white p-3 rounded-xl rounded-tl-none mr-auto max-w-[80%] relative"
          >
            <div className="text-sm">{assistantMessage}</div>
            <div className="absolute left-0 top-0 w-2 h-2 transform -translate-x-2 -translate-y-1/2 bg-[#35cab4] rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceSubtitles;
