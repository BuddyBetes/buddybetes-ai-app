import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

// Import refactored components
import PasswordResetRequestForm from '@/components/auth/PasswordResetRequestForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import PasswordResetLoading from '@/components/auth/PasswordResetLoading';
import PasswordResetSuccess from '@/components/auth/PasswordResetSuccess';

const ResetPassword = () => {
  const { isAuthenticated, loading, signOut, isPasswordRecovery } = useAuth();
  const [mode, setMode] = useState<'request' | 'reset'>('reset');
  const [resetComplete, setResetComplete] = useState(false);
  const [isValidResetLink, setIsValidResetLink] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if we're coming from a password reset link
  useEffect(() => {
    const checkResetToken = async () => {
      try {
        setIsCheckingLink(true);
        
        // Check if we have a recovery token in the URL
        const hash = location.hash;
        const queryParams = new URLSearchParams(location.search);
        
        // Handle both types of reset links (hash-based and query-based)
        const hasResetToken = 
          (hash && hash.includes('type=recovery')) || 
          queryParams.has('type') && queryParams.get('type') === 'recovery';
        
        console.log('Checking reset token, hasResetToken:', hasResetToken);
        
        if (!hasResetToken) {
          console.log('No valid recovery token found in URL, showing request form');
          setIsValidResetLink(false);
          setMode('request');
          setIsCheckingLink(false);
          return;
        }
        
        // Let Supabase handle the recovery token
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session from reset link:', error);
          setIsValidResetLink(false);
          setMode('request');
          toast({
            title: "Invalid or Expired Link",
            description: "This password reset link is invalid or has expired. Please request a new one.",
            variant: "destructive",
          });
        } else if (!data.session) {
          console.log('No session found from recovery token, showing request form');
          setIsValidResetLink(false);
          setMode('request');
        } else {
          console.log('Valid reset token, user can now reset password');
          setIsValidResetLink(true);
          setMode('reset');
        }
      } catch (err) {
        console.error('Error validating reset token:', err);
        setIsValidResetLink(false);
        setMode('request');
        toast({
          title: "Error",
          description: "An error occurred while processing your reset link.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingLink(false);
      }
    };

    checkResetToken();
  }, [location, toast]);

  // Handle reset completion
  const handleResetComplete = () => {
    setResetComplete(true);
  };

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
                : "Enter your new password below"}
            </p>
          </div>
        </div>

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

export default ResetPassword;
