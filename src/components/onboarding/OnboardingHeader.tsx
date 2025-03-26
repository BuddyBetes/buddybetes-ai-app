
import React from 'react';
import { motion } from 'framer-motion';

const OnboardingHeader: React.FC = () => {
  return (
    <motion.div 
      className="mb-8 text-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 
        className="text-3xl font-semibold tracking-tight mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Welcome to BuddyBetes
      </motion.h1>
      <motion.p 
        className="text-gray-500 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Let's set up your profile to get started
      </motion.p>
    </motion.div>
  );
};

export default OnboardingHeader;
