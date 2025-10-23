
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ForgotPassword from '@/components/auth/ForgotPassword';
import SignInForm from '@/components/auth/SignInForm';
import SignInLogo from '@/components/auth/SignInLogo';

const SignIn = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Show confirmation message if coming from signup
  useEffect(() => {
    const state = location.state as { showConfirmationMessage?: boolean; email?: string };
    
    if (state?.showConfirmationMessage) {
      toast({
        title: "📧 Email Confirmation Sent",
        description: `We've sent a confirmation email to ${state.email}. Please check your inbox and spam folder.`,
        duration: 15000,
      });
      
      // Clear state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location, toast]);

  // Redirect authenticated users directly to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (showForgotPassword) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mx-auto w-full max-w-md"
        >
          <ForgotPassword onCancel={() => setShowForgotPassword(false)} />
        </motion.div>
      </div>
    );
  }

  const state = location.state as { showConfirmationMessage?: boolean; email?: string };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-md"
      >
        <SignInLogo />
        
        {state?.showConfirmationMessage && (
          <Alert className="mb-6 border-buddy-500 bg-buddy-50">
            <Mail className="h-5 w-5 text-buddy-500" />
            <AlertTitle className="text-buddy-700">Email Confirmation Required</AlertTitle>
            <AlertDescription className="text-buddy-600">
              Please check your email inbox and spam folder for the confirmation link. 
              You must confirm your email before signing in.
            </AlertDescription>
          </Alert>
        )}
        
        <SignInForm onForgotPassword={() => setShowForgotPassword(true)} />
      </motion.div>
    </div>
  );
};

export default SignIn;
