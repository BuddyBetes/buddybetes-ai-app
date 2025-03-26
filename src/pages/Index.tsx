
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, hasCompletedOnboarding, loading, isPasswordRecovery } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout if it exists
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
    }

    // Don't redirect while still loading authentication state
    if (loading) {
      return;
    }

    // Set initializing to false after loading is complete
    setIsInitializing(false);
    
    console.log('Auth loaded:', { isAuthenticated, hasCompletedOnboarding, isPasswordRecovery });
    
    // Capture the tokens from URL if they exist - before any redirection happens
    const url = new URL(window.location.href);
    const hash = url.hash;
    const query = url.search;
    
    // Extract tokens from URL if present
    const hashParams = new URLSearchParams(hash.replace('#', ''));
    const accessToken = hashParams.get('access_token') || new URLSearchParams(query).get('access_token');
    const refreshToken = hashParams.get('refresh_token') || new URLSearchParams(query).get('refresh_token');
    const recoveryToken = hashParams.get('type') === 'recovery' || new URLSearchParams(query).get('type') === 'recovery';
    
    // If in password recovery flow, immediately redirect to reset password page with token info
    if (isPasswordRecovery || accessToken || recoveryToken) {
      console.log('Redirecting to reset password page immediately with token state');
      // Pass tokens as state to preserve them during navigation
      navigate('/reset-password', { 
        state: { 
          fromReset: true,
          accessToken: accessToken || null,
          refreshToken: refreshToken || null,
          recoveryToken: recoveryToken || null
        },
        replace: true  // Replace the current entry in history to prevent back navigation issues
      });
      return; // Important: exit early to prevent other redirects
    }
    
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        if (hasCompletedOnboarding) {
          console.log('Redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.log('Redirecting to onboarding');
          navigate('/onboarding');
        }
      } else {
        console.log('Redirecting to signin');
        navigate('/signin');
      }
    }, 1500); // Reduced from 2000ms to 1500ms for faster redirect
    
    setRedirectTimeout(timer);
    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated, hasCompletedOnboarding, loading, isPasswordRecovery]);

  // Don't render splash screen if we're still determining auth state
  // This prevents the flash of content before redirect
  if (loading || isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-buddy-500 flex items-center justify-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <Mic size={40} className="text-white" />
          </motion.div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-gray-600 font-medium"
        >
          Loading your experience...
        </motion.p>
      </div>
    );
  }

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
          BuddyBetes
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Your BestFriend in Diabetes Care
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Index;
