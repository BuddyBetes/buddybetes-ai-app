
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
  signOut: () => Promise<void>;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  isPasswordRecovery: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const { toast } = useToast();

  // Detect password recovery flow from URL
  useEffect(() => {
    const detectPasswordRecovery = () => {
      const url = new URL(window.location.href);
      const hash = url.hash;
      const query = url.search;
      
      // Check for password recovery tokens in different formats
      const isRecoveryFlow = 
        (hash && hash.includes('type=recovery')) || 
        (query && query.includes('type=recovery'));
      
      if (isRecoveryFlow) {
        console.log('Password recovery flow detected');
        setIsPasswordRecovery(true);
      }
    };
    
    detectPasswordRecovery();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setHasCompletedOnboarding(false);
        } else if (event === 'SIGNED_IN' && currentSession?.user) {
          // Don't automatically check onboarding if in password recovery
          if (!isPasswordRecovery) {
            checkOnboardingStatus(currentSession.user.id);
          }
        }
      }
    );

    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user && !isPasswordRecovery) {
          await checkOnboardingStatus(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast({
          title: "Error",
          description: "Failed to retrieve your session. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, isPasswordRecovery]);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('health_data')
        .select('completed_onboarding')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking onboarding status:', error);
      } else {
        console.log('Onboarding status data:', data);
        setHasCompletedOnboarding(data?.completed_onboarding || false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

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
      toast({
        title: "Sign Up Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
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
      toast({
        title: "Sign In Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setHasCompletedOnboarding(false);
    setIsPasswordRecovery(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        isPasswordRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
