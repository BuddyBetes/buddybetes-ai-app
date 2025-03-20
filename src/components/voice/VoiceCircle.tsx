
import React from 'react';
import { motion } from 'framer-motion';
import { Loader, Mic } from 'lucide-react';
import PulseAnimation from './PulseAnimation';
import CancelButton from './CancelButton';

interface VoiceCircleProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onStopButtonClick: () => void;
}

const VoiceCircle: React.FC<VoiceCircleProps> = ({ status, onStopButtonClick }) => {
  // Render content for the main circle based on the current status
  const renderCircleContent = () => {
    if (status === 'processing') {
      return <Loader size={48} className="text-white animate-spin" />;
    } else if (status === 'speaking') {
      return <Mic size={48} className="text-white" />;
    }
    return null;
  };

  return (
    <div className="relative mb-16">
      <motion.div 
        className="w-48 h-48 rounded-full bg-[#35cab4] flex items-center justify-center relative"
        animate={{
          scale: status === 'speaking' ? [1, 1.05, 1] : 1
        }}
        transition={{ 
          duration: 2, 
          repeat: status === 'speaking' ? Infinity : 0,
          repeatType: "loop" 
        }}
      >
        <PulseAnimation isActive={status === 'listening'} />
        {renderCircleContent()}
      </motion.div>
      
      {status === 'listening' && (
        <CancelButton onClick={onStopButtonClick} />
      )}
    </div>
  );
};

export default VoiceCircle;
