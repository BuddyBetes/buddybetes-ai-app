
import React, { useState } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceButtonProps {
  onStartSession?: () => void;
  onEndSession?: () => void;
  onTextMode?: () => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  onStartSession, 
  onEndSession,
  onTextMode
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const handleToggle = () => {
    if (isListening) {
      setIsListening(false);
      setIsPulsing(false);
      onEndSession && onEndSession();
    } else {
      setIsListening(true);
      setIsPulsing(true);
      onStartSession && onStartSession();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`relative w-32 h-32 rounded-full flex items-center justify-center mb-8 ${
          isListening ? 'bg-red-500/10' : 'bg-buddy-500/10'
        }`}
      >
        {isPulsing && (
          <AnimatePresence>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0.7 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: i * 0.6,
                  ease: "easeOut"
                }}
                className="absolute w-full h-full rounded-full bg-buddy-500/20"
              />
            ))}
          </AnimatePresence>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-24 h-24 rounded-full shadow-lg flex items-center justify-center z-10 ${
            isListening ? 'bg-red-500' : 'bg-buddy-500'
          }`}
          onClick={handleToggle}
        >
          {isListening ? (
            <MicOff size={40} className="text-white" />
          ) : (
            <Mic size={40} className="text-white" />
          )}
        </motion.button>
        
        {isListening && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md"
            onClick={() => {
              setIsListening(false);
              setIsPulsing(false);
              onEndSession && onEndSession();
            }}
          >
            <X size={16} className="text-gray-600" />
          </motion.button>
        )}
      </motion.div>
      
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Tagalog</span>
          <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
            <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white"></div>
          </div>
          <span className="text-sm font-medium text-gray-500">Off</span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full rounded-full py-4 px-8 font-medium text-white shadow-md ${
            isListening ? 'bg-red-500' : 'bg-buddy-500'
          }`}
          onClick={handleToggle}
        >
          {isListening ? 'End Session' : 'Start Session'}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-full py-3 px-8 font-medium text-gray-700 border border-gray-300 flex items-center justify-center space-x-2"
          onClick={onTextMode}
        >
          <span className="text-xl">💬</span>
          <span>Text Mode</span>
        </motion.button>
      </div>
    </div>
  );
};

export default VoiceButton;
