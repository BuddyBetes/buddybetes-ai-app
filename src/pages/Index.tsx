import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, hasCompletedOnboarding, loading, isPasswordRecovery } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
    }

    if (loading) {
      return;
    }

    setIsInitializing(false);
    
    console.log('Auth loaded:', { isAuthenticated, hasCompletedOnboarding, isPasswordRecovery });
    
    const url = new URL(window.location.href);
    const hash = url.hash;
    const query = url.search;
    
    const hashParams = new URLSearchParams(hash.replace('#', ''));
    const accessToken = hashParams.get('access_token') || new URLSearchParams(query).get('access_token');
    const refreshToken = hashParams.get('refresh_token') || new URLSearchParams(query).get('refresh_token');
    const recoveryToken = hashParams.get('type') === 'recovery' || new URLSearchParams(query).get('type') === 'recovery';
    
    if (isPasswordRecovery || accessToken || recoveryToken) {
      console.log('Redirecting to reset password page immediately with token state');
      navigate('/reset-password', { 
        state: { 
          fromReset: true,
          accessToken: accessToken || null,
          refreshToken: refreshToken || null,
          recoveryToken: recoveryToken || null
        },
        replace: true
      });
      return;
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
    }, 1500);

    setRedirectTimeout(timer);
    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated, hasCompletedOnboarding, loading, isPasswordRecovery]);

  if (loading || isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-white flex items-center justify-center"
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
            <img src="/logo.png" alt="BuddyBetes Logo" className="w-20 h-20" />
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
          className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-8"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src="/logo.png" alt="BuddyBetes Logo" className="w-28 h-28" />
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
