
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const ResetPassword = () => {
  const { isAuthenticated, hasCompletedOnboarding, signOut } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isValidResetLink, setIsValidResetLink] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isProcessingReset, setIsProcessingReset] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

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
        
        if (!hasResetToken) {
          console.log('No valid recovery token found in URL');
          setIsValidResetLink(false);
          setIsCheckingLink(false);
          setIsProcessingReset(false);
          toast({
            title: "Invalid Reset Link",
            description: "This link is not a valid password reset link.",
            variant: "destructive",
          });
          return;
        }
        
        // Let Supabase handle the recovery token
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session from reset link:', error);
          setIsValidResetLink(false);
          setIsProcessingReset(false);
          toast({
            title: "Invalid or Expired Link",
            description: "This password reset link is invalid or has expired. Please request a new one.",
            variant: "destructive",
          });
        } else if (!data.session) {
          console.log('No session found, invalid reset token');
          setIsValidResetLink(false);
          setIsProcessingReset(false);
          toast({
            title: "Invalid Reset Link",
            description: "This password reset link is invalid. Please request a new one.",
            variant: "destructive",
          });
        } else {
          console.log('Valid reset token, user can now reset password');
          setIsValidResetLink(true);
          setIsProcessingReset(false);
        }
      } catch (err) {
        console.error('Error validating reset token:', err);
        setIsValidResetLink(false);
        setIsProcessingReset(false);
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

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResetComplete(true);
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated. You can now log in with your new password.",
          duration: 5000,
        });
        
        // Sign out the user after password reset so they can sign in with new password
        await signOut();
        
        // Redirect to signin page after 3 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "An error occurred",
        description: error?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only redirect authenticated users if they're not in the middle of a password reset
  if (isAuthenticated && !isValidResetLink && !isProcessingReset) {
    if (!hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while checking the reset link
  if (isCheckingLink || isProcessingReset) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] p-4">
        <Card className="border-none shadow-lg w-full max-w-md">
          <CardContent className="p-6 pt-6 text-center">
            <Lock size={32} className="mx-auto text-buddy-500 mb-4" />
            <h1 className="text-2xl font-semibold mb-4">Verifying Reset Link</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-buddy-500"></div>
            </div>
            <p className="mt-4 text-gray-500">Please wait while we verify your password reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If reset link is invalid, show error
  if (!isValidResetLink) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] p-4">
        <Card className="border-none shadow-lg w-full max-w-md">
          <CardContent className="p-6 pt-6 text-center">
            <div className="text-red-500 mb-4">
              <Lock size={32} className="mx-auto" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Invalid Reset Link</h1>
            <p className="text-gray-500 mb-6">This password reset link is invalid or has expired.</p>
            <Button 
              onClick={() => navigate('/signin')}
              className="w-full h-12 bg-buddy-500 hover:bg-buddy-600"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
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
              Enter your new password below
            </p>
          </div>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6 pt-6">
            {resetComplete ? (
              <div className="text-center py-6">
                <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
                  <p className="font-medium">Password reset successful!</p>
                  <p className="text-sm mt-1">You will be redirected to the login page in a few seconds...</p>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">New Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="h-12 text-base border-gray-200 focus:border-buddy-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="h-12 text-base border-gray-200 focus:border-buddy-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-buddy-500 hover:bg-buddy-600 transition-all duration-200 mt-6 flex items-center justify-center gap-2 text-base font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Reset Password"} 
                    {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
