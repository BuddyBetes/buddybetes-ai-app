
import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

const SignInLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-6 mb-8">
      <motion.div 
        className="w-20 h-20 rounded-full bg-buddy-500 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Mic size={32} className="text-white" />
      </motion.div>
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Welcome Back</h1>
        <p className="text-gray-500 text-lg">
          Sign in to continue to BuddyBetes
        </p>
      </div>
    </div>
  );
};

export default SignInLogo;
