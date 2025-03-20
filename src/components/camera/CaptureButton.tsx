
import React from 'react';
import { motion } from 'framer-motion';

interface CaptureButtonProps {
  onCapture: () => void;
  disabled: boolean;
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ onCapture, disabled }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className="bg-white w-16 h-16 rounded-full flex items-center justify-center"
      onClick={onCapture}
      disabled={disabled}
    >
      <div className="bg-white w-14 h-14 rounded-full border-2 border-black"></div>
    </motion.button>
  );
};

export default CaptureButton;
