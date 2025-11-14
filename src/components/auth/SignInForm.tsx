
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, AlertTriangle, Eye, EyeOff, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface SignInFormProps {
  onForgotPassword: () => void;
  showEmailConfirmationReminder?: boolean;
  signupEmail?: string;
  emphasizeConfirmation?: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({ 
  onForgotPassword, 
  showEmailConfirmationReminder,
  signupEmail,
  emphasizeConfirmation 
}) => {
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<{ title: string; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
        
        if (errorCode.includes('Email not confirmed')) {
          setAuthError({
            title: 'Email Not Confirmed',
            message: 'Please check your email and click the confirmation link before signing in.'
          });
        } else if (errorCode.includes('Invalid login credentials')) {
          setAuthError({
            title: 'Invalid Credentials',
            message: 'The email or password you entered is incorrect. Please try again or reset your password.'
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {showEmailConfirmationReminder && signupEmail && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Mail className="h-5 w-5 text-blue-500" />
          <AlertTitle className="text-blue-700">Check Your Email</AlertTitle>
          <AlertDescription className="text-blue-600">
            We've sent a confirmation email to <strong>{signupEmail}</strong>. 
            {emphasizeConfirmation && (
              <span className="block mt-2 font-semibold">
                ⚠️ You must confirm your email before you can sign in.
              </span>
            )}
            Please check your inbox and click the confirmation link.
          </AlertDescription>
        </Alert>
      )}
      
      {authError && (
        <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-700">{authError.title}</AlertTitle>
          <AlertDescription className="text-red-600">
            {authError.message}
          </AlertDescription>
        </Alert>
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
                        onClick={onForgotPassword}
                      >
                        Forgot password?
                      </button>
                    </div>
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
    </>
  );
};

export default SignInForm;
