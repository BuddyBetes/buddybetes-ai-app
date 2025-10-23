
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, MailCheck } from 'lucide-react';

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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Email request schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

const PasswordResetRequestForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Email request form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle email request submission - Use custom edge function
  const onRequestReset = async (values: EmailFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: values.email,
          resetUrl: `${window.location.origin}/reset-password`,
        }
      });

      if (error) {
        console.error('Password reset request error:', error);
        toast({
          title: "Request Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setShowEmailSent(true);
        emailForm.reset();
      }
    } catch (error: any) {
      console.error('Password reset request error:', error);
      toast({
        title: "An error occurred",
        description: error?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close email sent dialog
  const handleCloseDialog = () => {
    setShowEmailSent(false);
    navigate('/signin');
  };

  return (
    <>
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onRequestReset)} className="space-y-5">
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
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
            className="w-full h-12 bg-buddy-500 hover:bg-buddy-600 transition-all duration-200 mt-6 flex items-center justify-center gap-2 text-base font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"} 
            {!isSubmitting && <ArrowRight className="h-5 w-5" />}
          </Button>
          
          <div className="text-center mt-4">
            <Button 
              variant="link" 
              onClick={() => navigate('/signin')}
              className="text-gray-500 hover:text-buddy-600"
            >
              Back to Sign In
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Email sent confirmation dialog */}
      <Dialog open={showEmailSent} onOpenChange={setShowEmailSent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center gap-2">
              <MailCheck size={32} className="text-green-500 mb-2" />
              Reset Link Sent
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={handleCloseDialog} className="bg-buddy-500 hover:bg-buddy-600">
              Return to Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PasswordResetRequestForm;
