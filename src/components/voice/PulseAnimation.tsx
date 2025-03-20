
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PulseAnimationProps {
  isActive: boolean;
}

const PulseAnimation = ({ isActive }: PulseAnimationProps) => {
  if (!isActive) return null;
  
  return (
    <AnimatePresence>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: 1.5, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            delay: i * 0.4,
            ease: "easeOut"
          }}
          className="absolute w-full h-full rounded-full bg-[#35cab4]/30"
        />
      ))}
    </AnimatePresence>
  );
};

export default PulseAnimation;
