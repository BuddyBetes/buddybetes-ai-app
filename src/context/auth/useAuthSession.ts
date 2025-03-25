
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Detect password recovery flow from URL and auth events
  useEffect(() => {
    const detectPasswordRecovery = () => {
      // Check URL parameters for recovery mode
      const url = new URL(window.location.href);
      const hash = url.hash;
      const query = url.search;
      
      // Extract tokens directly
      const hashParams = new URLSearchParams(hash.replace('#', ''));
      const accessToken = hashParams.get('access_token');
      const typeParam = hashParams.get('type');
      
      const queryParams = new URLSearchParams(query);
      const queryAccessToken = queryParams.get('access_token');
      const queryTypeParam = queryParams.get('type');
      
      // Check for password recovery tokens in different formats
      const isRecoveryFlow = 
        (accessToken !== null) || 
        (queryAccessToken !== null) || 
        (typeParam === 'recovery') || 
        (queryTypeParam === 'recovery');
      
      if (isRecoveryFlow) {
        console.log('Password recovery flow detected from URL with tokens:', { 
          hasAccessToken: !!accessToken || !!queryAccessToken,
          hasRecoveryType: typeParam === 'recovery' || queryTypeParam === 'recovery'
        });
        setIsPasswordRecovery(true);
        
        // If we have the access token, attempt to set the session directly
        // This helps when the token might get lost in navigation
        if (accessToken || queryAccessToken) {
          const token = accessToken || queryAccessToken;
          const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token') || '';
          
          console.log('Found access token, attempting to set session directly');
          supabase.auth.setSession({
            access_token: token!,
            refresh_token: refreshToken
          }).then(({ data, error }) => {
            if (error) {
              console.error('Error setting session directly:', error);
            } else if (data.session) {
              console.log('Successfully set session directly from URL tokens');
            }
          });
        }
      }
    };
    
    detectPasswordRecovery();

    // Also listen for auth state changes to detect PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected');
        setIsPasswordRecovery(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Mark as password recovery mode if we get that event
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else if (event === 'SIGNED_OUT') {
          setIsPasswordRecovery(false);
        }
      }
    );

    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    loading,
    isAuthenticated: !!user,
    isPasswordRecovery
  };
}
