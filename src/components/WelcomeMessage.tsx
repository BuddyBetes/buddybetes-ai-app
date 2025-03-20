
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface WelcomeMessageProps {
  onDismiss: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="glassmorphism rounded-lg p-4 mb-6 relative"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-buddy-100 rounded-full">
          <MessageSquare className="text-buddy-600 h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-buddy-700">Welcome to your Glucose Buddy Assistant!</h3>
          <p className="text-sm text-gray-600 mt-1">
            I can help you understand your glucose readings, suggest meal options, and provide health tips based on your data.
            Try asking me a question or use the suggestion chips below.
          </p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDismiss}
        className="mt-3 text-sm text-buddy-600 font-medium hover:text-buddy-700"
      >
        Got it
      </motion.button>
    </motion.div>
  );
};

export default WelcomeMessage;
