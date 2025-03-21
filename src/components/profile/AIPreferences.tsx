
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const AIPreferences = () => {
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  return (
    <motion.div 
      custom={0}
      variants={itemVariants}
      className="p-4 border-b border-gray-100"
    >
      <h3 className="text-sm font-medium text-gray-500 mb-4">AI Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-buddy-100 flex items-center justify-center">
              <span className="text-buddy-600 text-xs">🇺🇸</span>
            </div>
            <span className="text-sm font-medium">English (US)</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
};

export default AIPreferences;
