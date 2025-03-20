
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface CancelButtonProps {
  onClick: () => void;
}

const CancelButton = ({ onClick }: CancelButtonProps) => {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md"
      onClick={onClick}
    >
      <X size={16} className="text-gray-600" />
    </motion.button>
  );
};

export default CancelButton;
