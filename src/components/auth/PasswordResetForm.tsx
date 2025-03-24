
import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { useResetPasswordForm } from './useResetPasswordForm';

interface PasswordResetFormProps {
  onResetComplete: () => void;
  signOut: () => Promise<void>;
}

const PasswordResetForm = ({ onResetComplete, signOut }: PasswordResetFormProps) => {
  const {
    form,
    isSubmitting,
    currentPassword,
    onSubmit,
    updateCurrentPassword
  } = useResetPasswordForm({ onResetComplete, signOut });

  // Update current password when form value changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.password !== undefined) {
        updateCurrentPassword(value.password);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <PasswordInput
              control={form.control}
              name="password"
              label="New Password"
              description={
                <>
                  <PasswordStrengthIndicator password={currentPassword} />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters with 1 uppercase letter and 1 number
                  </p>
                </>
              }
            />
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <PasswordInput
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
            />
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
