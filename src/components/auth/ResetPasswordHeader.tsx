
import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { usePasswordReset } from '@/context/passwordReset/PasswordResetContext';

const ResetPasswordHeader: React.FC = () => {
  const { mode, resetComplete } = usePasswordReset();

  return (
    <div className="flex flex-col items-center space-y-6 mb-8">
      <motion.div 
        className="w-20 h-20 rounded-full bg-buddy-500 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Lock size={32} className="text-white" />
      </motion.div>
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Reset Password</h1>
        <p className="text-gray-500 text-lg">
          {mode === 'request' 
            ? "Enter your email to receive a password reset link" 
            : resetComplete 
              ? "Password reset successful!" 
              : "Enter your new password below"}
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordHeader;
