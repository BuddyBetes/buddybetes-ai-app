import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms and Conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const SignUp = () => {
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error, user } = await signUp(values.email, values.password);
      
      if (!error && user) {
        console.log('[SIGNUP] User created successfully:', user.id);
        
        // Show 30-second prominent toast notification
        toast({
          title: "🎉 Account Created Successfully!",
          description: `We've sent a confirmation email to ${values.email}. Please check your inbox and spam folder to activate your account before signing in.`,
          duration: 30000,
          className: "text-lg p-6 border-2 border-buddy-500",
        });
        
        // Redirect to signin WITHOUT state - clean URL
        setTimeout(() => {
          navigate('/signin', { replace: true });
        }, 500);
        
      } else if (error) {
        console.error('[SIGNUP] Error:', error);
        toast({
          title: "Signup Failed",
          description: error.message || "Unable to create account. Please try again.",
          variant: "destructive",
          duration: 8000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
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
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src="/logo.png" alt="BuddyBetes Logo" className="w-16 h-16" />
          </motion.div>
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Create Account</h1>
            <p className="text-gray-500 text-lg">
              Join BuddyBetes to get started
            </p>
          </div>
        </div>

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
                      <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            {...field} 
                            className="h-12 text-base border-gray-200 focus:border-buddy-500 pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
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
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            {...field} 
                            className="h-12 text-base border-gray-200 focus:border-buddy-500 pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border border-gray-100 bg-gray-50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-buddy-500 data-[state=checked]:border-buddy-500"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium leading-none">
                          I have read and accept the{" "}
                          <Link to="/terms" className="text-buddy-500 hover:underline cursor-pointer">
                            Terms and Conditions
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-buddy-500 hover:bg-buddy-600 transition-all duration-200 mt-6 flex items-center justify-center gap-2 text-base font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                  {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/signin" className="text-buddy-500 hover:text-buddy-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
