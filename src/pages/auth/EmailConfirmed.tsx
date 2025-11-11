
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EmailConfirmed = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [confirmationStatus, setConfirmationStatus] = useState<'success' | 'error' | 'processing'>('processing');

  // Check for confirmation token in URL and process it
  useEffect(() => {
    const processEmailConfirmation = async () => {
      try {
        // The Supabase client will automatically process the token in the URL
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Email confirmation failed:', error.message);
          setConfirmationStatus('error');
          toast({
            title: "Confirmation Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setConfirmationStatus('success');
          toast({
            title: "Email Confirmed",
            description: "Your email has been successfully confirmed. You can now sign in.",
          });
        }
      } catch (err) {
        console.error('Error processing confirmation:', err);
        setConfirmationStatus('error');
      }
    };

    processEmailConfirmation();
  }, [toast]);

  // If already authenticated, redirect to onboarding after a delay
  useEffect(() => {
    if (isAuthenticated && confirmationStatus === 'success') {
      const timer = setTimeout(() => {
        navigate('/onboarding');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, confirmationStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2
                }}
              >
                {confirmationStatus === 'processing' ? (
                  <div className="h-16 w-16 rounded-full border-4 border-buddy-300 border-t-buddy-500 animate-spin" />
                ) : confirmationStatus === 'success' ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {confirmationStatus === 'processing' 
                ? 'Processing...' 
                : confirmationStatus === 'success' 
                  ? 'Email Confirmed!' 
                  : 'Confirmation Failed'}
            </CardTitle>
            <CardDescription>
              {confirmationStatus === 'processing' 
                ? 'Please wait while we verify your email...' 
                : confirmationStatus === 'success' 
                  ? 'Your email has been successfully verified.' 
                  : 'There was an issue confirming your email address.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-gray-600">
            {confirmationStatus === 'success' && (
              <p>
                Thank you for confirming your email address! 🎉 You'll be redirected to complete your profile setup in a moment.
              </p>
            )}
            {confirmationStatus === 'error' && (
              <p>
                Please check your confirmation link or try requesting a new confirmation email.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              className="w-full" 
              asChild
            >
              <Link to="/signin">
                Sign In
              </Link>
            </Button>
            {isAuthenticated && confirmationStatus === 'success' && (
              <Button 
                variant="outline"
                className="w-full" 
                asChild
              >
                <Link to="/onboarding">
                  Complete Profile Setup
                </Link>
              </Button>
            )}
            {confirmationStatus === 'error' && (
              <Button 
                variant="outline"
                className="w-full"

                asChild
              >
                <Link to="/signup">
                  Back to Sign Up
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailConfirmed;
