
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
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { toast } = useToast();

  // Function to check and update onboarding status
  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data: healthData, error } = await supabase
        .from('health_data')
        .select('completed_onboarding')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      // If we have health data and onboarding is completed, update state
      setHasCompletedOnboarding(!!healthData?.completed_onboarding);
      
      return !!healthData?.completed_onboarding;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          await checkOnboardingStatus(currentSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setHasCompletedOnboarding(false);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
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
  }, [toast]);

  // Update the onboarding status in the database
  const updateOnboardingStatus = async (value: boolean) => {
    if (!user) return;
    
    try {
      // First check if a health_data record exists
      const { data: existingData } = await supabase
        .from('health_data')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingData) {
        // Update existing record
        await supabase
          .from('health_data')
          .update({ completed_onboarding: value })
          .eq('user_id', user.id);
      } else if (value) {
        // If we're trying to mark as completed but no record exists,
        // create a minimal record (other fields will be filled during onboarding)
        await supabase
          .from('health_data')
          .insert({
            user_id: user.id,
            completed_onboarding: true
          });
      }
      
      // Update local state
      setHasCompletedOnboarding(value);
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      toast({
        title: "Error",
        description: "Failed to update onboarding status.",
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
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
        setHasCompletedOnboarding: updateOnboardingStatus,
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
