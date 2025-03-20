
import React from 'react';
import { motion } from 'framer-motion';
import { Loader, Mic } from 'lucide-react';
import PulseAnimation from './PulseAnimation';
import CancelButton from './CancelButton';

interface VoiceCircleProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onStopButtonClick: () => void;
  onClick?: () => void;
}

const VoiceCircle: React.FC<VoiceCircleProps> = ({ status, onStopButtonClick, onClick }) => {
  // Render content for the main circle based on the current status
  const renderCircleContent = () => {
    if (status === 'processing') {
      return <Loader size={48} className="text-white animate-spin" />;
    } else if (status === 'speaking') {
      return <Mic size={48} className="text-white" />;
    } else if (status === 'idle') {
      return <Mic size={48} className="text-white" />;
    }
    return null;
  };

  // Determine if the circle should have hover effects (only when not processing or speaking)
  const isInteractive = status !== 'processing' && status !== 'speaking';
  
  return (
    <div className="relative mb-16">
      <motion.div 
        className={`w-48 h-48 rounded-full bg-[#35cab4] flex items-center justify-center relative 
          ${isInteractive ? 'shadow-lg hover:shadow-xl hover:bg-[#2ba999] cursor-pointer transition-all duration-200' : ''}`}
        animate={{
          scale: status === 'speaking' ? [1, 1.05, 1] : 1
        }}
        transition={{ 
          duration: 2, 
          repeat: status === 'speaking' ? Infinity : 0,
          repeatType: "loop" 
        }}
        whileHover={isInteractive ? { scale: 1.05 } : {}}
        whileTap={isInteractive ? { scale: 0.95 } : {}}
        onClick={isInteractive && onClick ? onClick : undefined}
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
