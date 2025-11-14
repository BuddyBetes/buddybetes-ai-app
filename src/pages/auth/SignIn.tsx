
import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';
import ForgotPassword from '@/components/auth/ForgotPassword';
import SignInForm from '@/components/auth/SignInForm';
import SignInLogo from '@/components/auth/SignInLogo';

const SignIn = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const fromSignup = location.state?.fromSignup;
  const signupEmail = location.state?.email;

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-md"
      >
        <SignInLogo />
        
        <SignInForm 
          onForgotPassword={() => setShowForgotPassword(true)}
          showEmailConfirmationReminder={fromSignup}
          signupEmail={signupEmail}
        />
      </motion.div>
    </div>
  );
};

export default SignIn;
