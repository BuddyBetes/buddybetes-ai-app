
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

interface ResetLocationState {
  fromReset?: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
  recoveryToken?: boolean | null;
}

const ResetPassword = () => {
  const { isAuthenticated, loading, signOut, isPasswordRecovery } = useAuth();
  const [mode, setMode] = useState<'request' | 'reset'>('request'); // Default to request mode
  const [resetComplete, setResetComplete] = useState(false);
  const [isValidResetLink, setIsValidResetLink] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [processingTokens, setProcessingTokens] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get location state from navigation, if any
  const locationState = location.state as ResetLocationState | null;

  // Process tokens from location state or URL
  useEffect(() => {
    const processTokens = async () => {
      try {
        setProcessingTokens(true);
        
        // Check if we have tokens in state from navigation
        if (locationState?.fromReset) {
          console.log('Found reset token state from navigation:', {
            hasAccessToken: !!locationState.accessToken,
            hasRecoveryToken: !!locationState.recoveryToken
          });
          
          // If we have an access token in state, try to set the session directly
          if (locationState.accessToken) {
            console.log('Setting session from navigation state token');
            const { data, error } = await supabase.auth.setSession({
              access_token: locationState.accessToken,
              refresh_token: locationState.refreshToken || ''
            });
            
            if (error) {
              console.error('Error setting session from navigation state:', error);
              setIsValidResetLink(false);
              setMode('request');
            } else if (data.session) {
              console.log('Successfully set session from navigation state');
              setIsValidResetLink(true);
              setMode('reset');
              return;
            }
          } else if (locationState.recoveryToken || isPasswordRecovery) {
            // If we have a recovery flag but no token, check if we're in recovery context
            console.log('Found recovery context, checking session');
            setIsValidResetLink(true);
            setMode('reset');
            return;
          }
        }
      } catch (err) {
        console.error('Error processing tokens from state:', err);
      } finally {
        setProcessingTokens(false);
      }
    };
    
    if (locationState?.fromReset) {
      processTokens();
    }
  }, [locationState, isPasswordRecovery]);

  // Check if we're coming from a password reset link (backup for direct URL access)
  useEffect(() => {
    const checkResetToken = async () => {
      // Skip if we already processed tokens from state
      if (processingTokens || (locationState?.fromReset && isValidResetLink)) {
        return;
      }
      
      try {
        setIsCheckingLink(true);
        
        // Get hash and query params
        const hash = location.hash;
        const searchParams = new URLSearchParams(location.search);
        
        // Check for type=recovery in either hash or query params
        const hashParams = new URLSearchParams(hash.replace('#', ''));
        const hasRecoveryInHash = hashParams.get('type') === 'recovery';
        const hasAccessTokenInHash = hashParams.get('access_token') !== null;
        const hasRecoveryInQuery = searchParams.get('type') === 'recovery';
        const hasAccessTokenInQuery = searchParams.get('access_token') !== null;
        
        // Check if already in password recovery context from AuthContext
        // This is a fallback in case URL parameters are missing
        const hasRecoveryContext = isPasswordRecovery;
        
        // Log for debugging
        console.log('Checking reset token:');
        console.log('- URL hash:', hash);
        console.log('- URL search:', location.search);
        console.log('- hasRecoveryInHash:', hasRecoveryInHash);
        console.log('- hasAccessTokenInHash:', hasAccessTokenInHash);
        console.log('- hasRecoveryInQuery:', hasRecoveryInQuery);
        console.log('- hasAccessTokenInQuery:', hasAccessTokenInQuery);
        console.log('- hasRecoveryContext:', hasRecoveryContext);
        
        // If we have any indication of recovery flow, attempt to process the reset
        if (hasRecoveryInHash || hasRecoveryInQuery || hasRecoveryContext || 
            hasAccessTokenInHash || hasAccessTokenInQuery) {
          console.log('Recovery mode detected, attempting to validate session');
          
          // Attempt to get session (Supabase should handle the token extraction)
          const { data, error } = await supabase.auth.getSession();
          
          console.log('Session check result:', data.session ? 'Session found' : 'No session');
          
          if (error) {
            console.error('Error retrieving session from reset link:', error);
            setIsValidResetLink(false);
            setMode('request');
            toast({
              title: "Invalid or Expired Link",
              description: "This password reset link is invalid or has expired. Please request a new one.",
              variant: "destructive",
            });
          } else if (data.session) {
            // If we have a session, user can reset password
            console.log('Valid reset token, showing password reset form');
            setIsValidResetLink(true);
            setMode('reset');
          } else {
            // Try to extract and process the token directly from URL
            try {
              // Get the access_token and refresh_token from the URL
              const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
              const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
              
              if (accessToken) {
                console.log('Found access token in URL, setting session manually');
                // Set the session manually if we have tokens
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                });
                
                if (sessionError) {
                  console.error('Error setting session:', sessionError);
                  setIsValidResetLink(false);
                  setMode('request');
                  toast({
                    title: "Invalid Reset Link",
                    description: "Unable to process the password reset link. Please request a new one.",
                    variant: "destructive",
                  });
                } else if (sessionData.session) {
                  console.log('Session set successfully, showing reset form');
                  setIsValidResetLink(true);
                  setMode('reset');
                } else {
                  console.log('No session after setting, showing request form');
                  setIsValidResetLink(false);
                  setMode('request');
                }
              } else if (hasRecoveryContext) {
                // If we're in recovery context from AuthContext but don't have tokens in URL,
                // we can still try to proceed with reset form if the user is authenticated
                console.log('Using recovery context from auth state');
                if (isAuthenticated && !loading) {
                  console.log('User is authenticated, showing reset form');
                  setIsValidResetLink(true);
                  setMode('reset');
                } else {
                  console.log('User not authenticated despite recovery context, showing request form');
                  setIsValidResetLink(false);
                  setMode('request');
                }
              } else {
                console.log('No tokens found in URL, showing request form');
                setIsValidResetLink(false);
                setMode('request');
              }
            } catch (tokenError) {
              console.error('Error processing token from URL:', tokenError);
              setIsValidResetLink(false);
              setMode('request');
            }
          }
        } else {
          // If we don't have a recovery token in either place, show request form
          console.log('No recovery token found, showing request form');
          setIsValidResetLink(false);
          setMode('request');
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

    // Force a small delay to ensure the URL is fully processed
    setTimeout(() => {
      checkResetToken();
    }, 150); // Slightly increased delay to ensure token processing
  }, [location, toast, isAuthenticated, loading, isPasswordRecovery, locationState, processingTokens, isValidResetLink]);

  // Prevent redirecting to dashboard if we're in password recovery mode
  useEffect(() => {
    if ((isPasswordRecovery || isValidResetLink) && isAuthenticated && !loading && !isCheckingLink) {
      console.log('In password recovery mode, preventing dashboard redirect');
      // Stay on reset password page when in password recovery flow
    }
  }, [isPasswordRecovery, isAuthenticated, navigate, loading, isCheckingLink, isValidResetLink]);

  // Handle reset completion - redirect to signin when complete
  const handleResetComplete = () => {
    setResetComplete(true);
  };

  // Effect to handle redirection after reset is complete
  useEffect(() => {
    if (resetComplete) {
      // Give time for the success message to be seen, then redirect
      const redirectTimer = setTimeout(() => {
        navigate('/signin', { replace: true });
      }, 3000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [resetComplete, navigate]);

  // Show loading state while checking the reset link
  if (loading || isCheckingLink || processingTokens) {
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
                : resetComplete 
                  ? "Password reset successful!" 
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
