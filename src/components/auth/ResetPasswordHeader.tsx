
import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { usePasswordReset } from '@/context/passwordReset/PasswordResetContext';

const ResetPasswordHeader: React.FC = () => {
  const { mode, resetComplete } = usePasswordReset();

  return (
    <div className="flex flex-col items-center space-y-6 mb-8">
      <div className="flex justify-center">
        <img src="/logo.png" alt="BuddyBetes Logo" className="w-24 h-auto" />
      </div>
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
