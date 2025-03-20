
import React from 'react';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onStartEndSession: () => void;
  onTextMode: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ status, onStartEndSession, onTextMode }) => {
  // Determine button label based on status
  const getButtonLabel = () => {
    switch (status) {
      case 'listening': return 'End Session';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Speaking...';
      default: return 'Start Session';
    }
  };

  // Determine button background color based on status
  const getBgColor = () => {
    switch (status) {
      case 'listening': return 'bg-red-500';
      case 'processing': return 'bg-yellow-500';
      case 'speaking': return 'bg-green-500';
      default: return 'bg-buddy-500';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`w-full rounded-full py-4 px-8 font-medium text-white shadow-md ${getBgColor()}`}
        onClick={onStartEndSession}
        disabled={status === 'processing' || status === 'speaking'}
      >
        {getButtonLabel()}
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
  );
};

export default ActionButtons;
