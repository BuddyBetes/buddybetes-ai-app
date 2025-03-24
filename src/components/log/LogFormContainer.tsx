
import React from 'react';
import { motion } from 'framer-motion';
import LogForm from '@/components/LogForm';

interface LogFormContainerProps {
  onLogAdded?: () => void;
}

const LogFormContainer: React.FC<LogFormContainerProps> = ({ onLogAdded }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <LogForm onLogAdded={onLogAdded} />
    </motion.div>
  );
};

export default LogFormContainer;
