
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuthOperations() {
  const signUp = async (email: string, password: string) => {
    console.log('[AUTH] Starting signup process for:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`,
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
      
      // Send custom email confirmation
      if (data.user) {
        try {
          console.log('[AUTH] Sending custom confirmation email...');
          const { error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
            body: {
              email: email,
              firstName: data.user.user_metadata?.first_name || '',
              lastName: data.user.user_metadata?.last_name || '',
              confirmationUrl: `${window.location.origin}/confirm?token=${data.user.id}`
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
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error('[AUTH] Sign up error:', error);
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
    signOut
  };
}
