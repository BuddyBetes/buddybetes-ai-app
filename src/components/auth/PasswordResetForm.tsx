
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';

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

// Form validation schema
const formSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

interface PasswordResetFormProps {
  onResetComplete: () => void;
  signOut: () => Promise<void>;
}

const PasswordResetForm = ({ onResetComplete, signOut }: PasswordResetFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password reset form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Handle password reset submission
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
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated. You can now log in with your new password.",
          duration: 5000,
        });
        
        // Call reset complete callback
        onResetComplete();
        
        // Sign out the user after password reset
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

  return (
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
  );
};

export default PasswordResetForm;
