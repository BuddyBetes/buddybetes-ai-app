
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { usePasswordReset } from '@/context/PasswordResetContext';
import { useAuth } from '@/context/AuthContext';
import PasswordResetRequestForm from '@/components/auth/PasswordResetRequestForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import PasswordResetSuccess from '@/components/auth/PasswordResetSuccess';
import PasswordResetLoading from '@/components/auth/PasswordResetLoading';
import ResetPasswordHeader from '@/components/auth/ResetPasswordHeader';

const ResetPasswordContainer: React.FC = () => {
  const { mode, resetComplete, isCheckingLink, handleResetComplete } = usePasswordReset();
  const { signOut, loading } = useAuth();

  // Show loading state while checking the reset link
  if (loading || isCheckingLink) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] p-4">
        <PasswordResetLoading />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-md"
      >
        <ResetPasswordHeader />

        <Card className="border-none shadow-lg">
          <CardContent className="p-6 pt-6">
            {mode === 'request' ? (
              <PasswordResetRequestForm />
            ) : resetComplete ? (
              <PasswordResetSuccess />
            ) : (
              <PasswordResetForm 
                onResetComplete={handleResetComplete} 
                signOut={signOut} 
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordContainer;
