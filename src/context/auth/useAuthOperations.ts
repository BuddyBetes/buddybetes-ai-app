import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuthOperations() {
  const [isSignupInProgress, setIsSignupInProgress] = useState(false);

  const signUp = async (email: string, password: string) => {
    console.log('[AUTH] Starting signup process for:', email);
    
    try {
      // Set flag BEFORE calling supabase to block redirects
      setIsSignupInProgress(true);
      console.log('[AUTH] Signup process started - blocking redirects');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`,
          data: {
            signup_timestamp: new Date().toISOString(),
          }
        }
      });
      
      console.log('[AUTH] Signup response:', { 
        hasUser: !!data.user, 
        userId: data.user?.id,
        emailSent: !error 
      });
      
      if (error) {
        console.error('[AUTH] Signup error:', error);
        throw error;
      }
      
      // Manually invoke custom email confirmation function
      if (data.user) {
        const confirmationUrl = `${window.location.origin}/confirm?token=${data.user.id}`;
        
        try {
          const { error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
            body: {
              email: email,
              firstName: data.user.user_metadata?.first_name || '',
              lastName: data.user.user_metadata?.last_name || '',
              confirmationUrl: confirmationUrl,
              userId: data.user.id
            }
          });
          
          if (emailError) {
            console.error('[AUTH] Failed to send confirmation email:', emailError);
          } else {
            console.log('[AUTH] Custom confirmation email sent successfully');
          }
        } catch (emailErr) {
          console.error('[AUTH] Email invocation error:', emailErr);
        }
        
        // CRITICAL: Sign out immediately after signup to enforce email confirmation
        // User must confirm email before they can sign in
        console.log('[AUTH] Signing out user to enforce email confirmation');
        await supabase.auth.signOut();
        console.log('[AUTH] User signed out - email confirmation required');
        
        // Wait for auth state to propagate to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('[AUTH] Auth state propagated');
        
        // Clear flag AFTER everything completes
        console.log('[AUTH] Signup process complete - unblocking redirects');
        setIsSignupInProgress(false);
      }
      
      // Check if profile was created by the trigger
      if (data.user) {
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();
          
          console.log('[AUTH] Profile check:', { 
            profileExists: !!profile,
            userId: data.user.id 
          });
        }, 1000);
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error('[AUTH] Sign up error:', error);
      setIsSignupInProgress(false); // Clear flag on error too
      return { user: null, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      // We'll handle the error display in the component
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      // Set a timeout to force logout if Supabase doesn't respond
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      );
      
      await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Sign out error:', error);
      // Force clear local session even if signOut fails
      localStorage.removeItem('sb-zjqiikollqinafveesvo-auth-token');
      window.location.href = '/signin';
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    isSignupInProgress
  };
}
