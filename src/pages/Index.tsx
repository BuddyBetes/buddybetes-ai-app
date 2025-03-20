
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to Dashboard after animation
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <motion.div 
          className="w-32 h-32 rounded-full bg-buddy-500 flex items-center justify-center mb-8"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mic size={64} className="text-white" />
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-bold mb-2 text-gray-900"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Glucose Buddy
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Your AI Health Assistant
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Index;
