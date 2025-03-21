
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasCompletedOnboarding, loading } = useAuth();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  // Add debugging logs
  useEffect(() => {
    console.log("Index page - Auth status:", { 
      loading, 
      isAuthenticated, 
      hasCompletedOnboarding,
      redirectAttempts
    });
  }, [loading, isAuthenticated, hasCompletedOnboarding, redirectAttempts]);

  useEffect(() => {
    // Wait for auth status to load, then redirect
    if (!loading) {
      console.log("Loading completed, preparing redirect");
      const timer = setTimeout(() => {
        console.log("Executing redirect with:", { isAuthenticated, hasCompletedOnboarding });
        setRedirectAttempts(prev => prev + 1);
        
        if (isAuthenticated) {
          if (hasCompletedOnboarding) {
            console.log("Redirecting to dashboard");
            navigate('/dashboard');
          } else {
            console.log("Redirecting to onboarding");
            navigate('/onboarding');
          }
        } else {
          console.log("Redirecting to signin");
          navigate('/signin');
        }
      }, redirectAttempts > 0 ? 1000 : 3000); // Reduce wait time after first attempt
      
      return () => clearTimeout(timer);
    }
  }, [navigate, isAuthenticated, hasCompletedOnboarding, loading, redirectAttempts]);

  // Add a safety fallback - if we're stuck for more than 10 seconds, force redirect to signin
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.log("Fallback redirect triggered");
      navigate('/signin');
    }, 10000);
    
    return () => clearTimeout(fallbackTimer);
  }, [navigate]);

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

        {loading && (
          <motion.p 
            className="text-sm text-gray-400 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Loading your profile...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default Index;
