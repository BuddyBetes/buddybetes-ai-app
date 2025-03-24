
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { resetPasswordSchema, ResetPasswordFormValues } from './resetPasswordSchema';

interface UseResetPasswordFormProps {
  onResetComplete: () => void;
  signOut: () => Promise<void>;
}

export const useResetPasswordForm = ({ onResetComplete, signOut }: UseResetPasswordFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password reset form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange', // Validate on change for better user experience
  });

  // Handle password reset submission
  const onSubmit = async (values: ResetPasswordFormValues) => {
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
          description: "Your password has been updated. You will be redirected to the sign in page.",
          duration: 5000,
        });
        
        // Call reset complete callback
        onResetComplete();
        
        // Sign out the user after password reset
        await signOut();
        
        // Redirect to signin page after 3 seconds
        setTimeout(() => {
          navigate('/signin', { replace: true });
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

  // Update current password when form value changes
  const updateCurrentPassword = (password: string) => {
    setCurrentPassword(password);
  };

  return {
    form,
    isSubmitting,
    currentPassword,
    onSubmit,
    updateCurrentPassword
  };
};
