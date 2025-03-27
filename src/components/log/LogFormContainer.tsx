
import React from 'react';
import LogForm from '../LogForm';
import { motion } from 'framer-motion';

interface LogFormContainerProps {
  onLogAdded?: () => void;
  initialGlucoseLevel?: number | null;
}

const LogFormContainer: React.FC<LogFormContainerProps> = ({ onLogAdded, initialGlucoseLevel }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="px-4 py-4"
    >
      <LogForm onLogAdded={onLogAdded} initialGlucoseLevel={initialGlucoseLevel} />
    </motion.div>
  );
};

export default LogFormContainer;
