
import React from 'react';
import { Camera, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface QuickActionButtonsProps {
  onScanFood: () => void;
  onScanMeter: () => void;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onScanFood,
  onScanMeter,
}) => {
  const navigate = useNavigate();

  const handleVoiceLog = () => {
    navigate('/assistant');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center space-x-4 mb-6 mt-4"
    >
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center"
        onClick={onScanFood}
      >
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-1">
          <Camera size={20} className="text-purple-600" />
        </div>
        <span className="text-xs font-medium text-gray-600">Scan Food</span>
      </motion.button>
      
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center"
        onClick={onScanMeter}
      >
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
          <Camera size={20} className="text-blue-600" />
        </div>
        <span className="text-xs font-medium text-gray-600">Scan Meter</span>
      </motion.button>
      
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center"
        onClick={handleVoiceLog}
      >
        <div className="w-12 h-12 rounded-full bg-buddy-100 flex items-center justify-center mb-1">
          <Mic size={20} className="text-buddy-600" />
        </div>
        <span className="text-xs font-medium text-gray-600">Voice Log</span>
      </motion.button>
    </motion.div>
  );
};

export default QuickActionButtons;
