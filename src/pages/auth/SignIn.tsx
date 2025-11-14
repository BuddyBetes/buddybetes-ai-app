
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import ForgotPassword from '@/components/auth/ForgotPassword';
import SignInForm from '@/components/auth/SignInForm';
import SignInLogo from '@/components/auth/SignInLogo';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const SignIn = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  // Check if user just signed up
  const emailSent = location.state?.emailSent;
  const userEmail = location.state?.email;

  // Show email confirmation modal on mount if redirected from signup
  useEffect(() => {
    if (emailSent) {
      setShowEmailConfirmation(true);
      // Clear the state so modal doesn't show on refresh
      window.history.replaceState({}, document.title);
    }
  }, [emailSent]);

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
    <>
      {/* Email Confirmation Reminder Modal */}
      <AlertDialog open={showEmailConfirmation} onOpenChange={setShowEmailConfirmation}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-buddy-100 p-3 rounded-full">
                <Mail className="h-8 w-8 text-buddy-500" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Check Your Email! 📧
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3">
              <p>
                We've sent a confirmation email to:
              </p>
              <p className="font-semibold text-gray-800">
                {userEmail}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-blue-800">
                  📬 Look for an email from <strong>noreply@buddybetes.com</strong>
                </p>
              </div>
              <p className="text-sm">
                Click the confirmation link in the email to activate your account, 
                then come back here to sign in.
              </p>
              <p className="text-xs text-gray-500">
                Don't forget to check your spam folder if you don't see it!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction className="w-full">
            Got it!
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-full max-w-md"
        >
          <SignInLogo />
          
          <SignInForm onForgotPassword={() => setShowForgotPassword(true)} />
        </motion.div>
      </div>
    </>
  );
};

export default SignIn;
