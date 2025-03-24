
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasCompletedOnboarding, loading } = useAuth();
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
    
    console.log('Auth loaded:', { isAuthenticated, hasCompletedOnboarding });
    
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
    }, 2000); // Reduced from 3000ms to 2000ms for faster redirect
    
    setRedirectTimeout(timer);
    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated, hasCompletedOnboarding, loading]);

  // Don't render splash screen if we're still determining auth state
  // This prevents the flash of content before redirect
  if (loading || isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-20 h-20 rounded-full bg-buddy-500 flex items-center justify-center">
          <Mic size={32} className="text-white animate-pulse" />
        </div>
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
