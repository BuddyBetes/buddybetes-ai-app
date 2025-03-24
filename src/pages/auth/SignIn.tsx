
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mic, ArrowRight, AlertTriangle } from 'lucide-react';

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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import { useAuth } from '@/context/AuthContext';
import ForgotPassword from '@/components/auth/ForgotPassword';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

const SignIn = () => {
  const { signIn, isAuthenticated, hasCompletedOnboarding } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [authError, setAuthError] = useState<{ title: string; message: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        // Handle specific error codes and provide meaningful messages
        const errorCode = error.message;
        
        if (errorCode.includes('Invalid login credentials')) {
          setAuthError({
            title: 'Authentication Failed',
            message: 'Incorrect email or password. Please try again.'
          });
        } else if (errorCode.includes('Email not confirmed')) {
          setAuthError({
            title: 'Email Not Confirmed',
            message: 'Please check your inbox and confirm your email before logging in.'
          });
        } else if (errorCode.includes('User not found')) {
          setAuthError({
            title: 'Account Not Found',
            message: "We couldn't find an account with this email. Please sign up instead."
          });
        } else {
          setAuthError({
            title: 'Login Error',
            message: error.message
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect authenticated users
  if (isAuthenticated) {
    if (!hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
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
        <div className="flex flex-col items-center space-y-6 mb-8">
          <motion.div 
            className="w-20 h-20 rounded-full bg-buddy-500 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mic size={32} className="text-white" />
          </motion.div>
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-gray-500 text-lg">
              Sign in to continue to BuddyBetes
            </p>
          </div>
        </div>

        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertTitle className="text-red-700">{authError.title}</AlertTitle>
              <AlertDescription className="text-red-600">
                {authError.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <Card className="border-none shadow-lg">
          <CardContent className="p-6 pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <button 
                          type="button"
                          className="text-sm text-buddy-500 hover:text-buddy-600 font-medium"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot password?
                        </button>
                      </div>
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
                  {isSubmitting ? "Signing in..." : "Sign In"} 
                  {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-buddy-500 hover:text-buddy-600 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
