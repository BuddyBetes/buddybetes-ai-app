
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuthOperations() {
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`
        }
      });
      
      if (error) throw error;
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      // Don't show toast here, we'll handle the error in the component
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
