
import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface StatusButtonProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onClick: () => void;
  disabled?: boolean;
}

const StatusButton = ({ status, onClick, disabled = false }: StatusButtonProps) => {
  // Determine icon based on status
  const renderIcon = () => {
    switch (status) {
      case 'listening':
        return <MicOff size={40} className="text-white" />;
      case 'processing':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </motion.div>
        );
      case 'speaking':
        return <Volume2 size={40} className="text-white" />;
      default:
        return <Mic size={40} className="text-white" />;
    }
  };

  // Determine background color based on status
  const getBgColor = () => {
    switch (status) {
      case 'listening': return 'bg-red-500';
      case 'processing': return 'bg-yellow-500';
      case 'speaking': return 'bg-green-500';
      default: return 'bg-buddy-500';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-24 h-24 rounded-full shadow-lg flex items-center justify-center z-10 ${getBgColor()}`}
      onClick={onClick}
      disabled={disabled || status === 'processing' || status === 'speaking'}
    >
      {renderIcon()}
    </motion.button>
  );
};

export default StatusButton;
