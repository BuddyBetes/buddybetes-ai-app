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
  isCheckingData: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isCheckingData, setIsCheckingData] = useState(true);
  const { toast } = useToast();

  // Function to check and update onboarding status
  const checkOnboardingStatus = async (userId: string) => {
    try {
      console.log("Checking onboarding status for user:", userId);
      
      // First check if any health_data records exist for this user
      const { data: healthDataCount, error: countError } = await supabase
        .from('health_data')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (countError) {
        console.error("Error checking health data count:", countError);
        return false;
      }
      
      // If no records exist, onboarding is not completed
      const count = (healthDataCount as any)?.count || 0;
      if (count === 0) {
        console.log("No health data found for user, onboarding not completed");
        return false;
      }
      
      // Get the most recent health data record
      const { data: healthData, error } = await supabase
        .from('health_data')
        .select('completed_onboarding')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error("Error getting most recent health data:", error);
        return false;
      }
      
      console.log("Found health data:", healthData);
      return !!healthData?.completed_onboarding;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing authentication state");
        setLoading(true);
        setIsCheckingData(true);
        
        // FIRST set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Auth state changed:", event);
            
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (event === 'SIGNED_IN' && currentSession?.user) {
              const onboardingStatus = await checkOnboardingStatus(currentSession.user.id);
              setHasCompletedOnboarding(onboardingStatus);
              setIsCheckingData(false);
            } else if (event === 'SIGNED_OUT') {
              setHasCompletedOnboarding(false);
              setIsCheckingData(false);
            }
          }
        );

        // THEN check for existing session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", initialSession ? "Session found" : "No session");
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          const onboardingStatus = await checkOnboardingStatus(initialSession.user.id);
          setHasCompletedOnboarding(onboardingStatus);
        }
        
        // Make sure we set loading to false even if there's no session
        setLoading(false);
        setIsCheckingData(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: "Error",
          description: "Failed to initialize authentication. Please refresh the page.",
          variant: "destructive",
        });
        
        // Ensure we set loading to false even if there's an error
        setLoading(false);
        setIsCheckingData(false);
      }
    };

    initAuth();
  }, [toast]); // Only run once on component mount

  // Update the onboarding status in the database
  const updateOnboardingStatus = async (value: boolean) => {
    if (!user) return;
    
    try {
      console.log("Updating onboarding status to:", value);
      
      // First check if a health_data record exists
      const { data: healthDataCount, error: countError } = await supabase
        .from('health_data')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (countError) throw countError;
      
      const count = (healthDataCount as any)?.count || 0;
      
      if (count > 0) {
        // If records exist, get the most recent one and update it
        const { data: latestRecord, error: getError } = await supabase
          .from('health_data')
          .select('id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (getError) throw getError;
        
        // Update the most recent record
        await supabase
          .from('health_data')
          .update({ 
            completed_onboarding: value,
            updated_at: new Date().toISOString()
          })
          .eq('id', latestRecord.id);
      } else if (value) {
        // If no records exist and we're trying to mark as completed, create a minimal record
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
        isCheckingData,
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
