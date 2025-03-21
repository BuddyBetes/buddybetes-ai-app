
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';

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

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type FormValues = z.infer<typeof formSchema>;

interface ForgotPasswordProps {
  onCancel: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Reset Email Sent",
          description: "Check your email for a password reset link",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6 pt-6">
        <div className="mb-4">
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 flex items-center text-sm mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign In
          </button>
          
          <h2 className="text-2xl font-semibold mb-1">Reset Password</h2>
          <p className="text-gray-500 text-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        {emailSent ? (
          <div className="text-center py-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
              <p className="font-medium">Reset link sent!</p>
              <p className="text-sm mt-1">Please check your email inbox for the password reset link</p>
            </div>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={onCancel}
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-buddy-500 hover:bg-buddy-600 transition-all duration-200 mt-4 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
