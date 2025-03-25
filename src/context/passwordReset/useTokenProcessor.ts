
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ResetLocationState } from './types';

export function useTokenProcessor({ 
  isPasswordRecovery, 
  setIsValidResetLink, 
  setMode
}: { 
  isPasswordRecovery: boolean;
  setIsValidResetLink: (value: boolean) => void;
  setMode: (value: 'request' | 'reset') => void;
}) {
  const [processingTokens, setProcessingTokens] = useState(false);
  const location = useLocation();
  
  // Get location state from navigation, if any
  const locationState = location.state as ResetLocationState | null;

  // Process tokens from location state
  useEffect(() => {
    const processTokens = async () => {
      try {
        setProcessingTokens(true);
        
        // Check if we have tokens in state from navigation
        if (locationState?.fromReset) {
          console.log('Found reset token state from navigation:', {
            hasAccessToken: !!locationState.accessToken,
            hasRecoveryToken: !!locationState.recoveryToken
          });
          
          // If we have an access token in state, try to set the session directly
          if (locationState.accessToken) {
            console.log('Setting session from navigation state token');
            const { data, error } = await supabase.auth.setSession({
              access_token: locationState.accessToken,
              refresh_token: locationState.refreshToken || ''
            });
            
            if (error) {
              console.error('Error setting session from navigation state:', error);
              setIsValidResetLink(false);
              setMode('request');
            } else if (data.session) {
              console.log('Successfully set session from navigation state');
              setIsValidResetLink(true);
              setMode('reset');
              return;
            }
          } else if (locationState.recoveryToken || isPasswordRecovery) {
            // If we have a recovery flag but no token, check if we're in recovery context
            console.log('Found recovery context, checking session');
            setIsValidResetLink(true);
            setMode('reset');
            return;
          }
        }
      } catch (err) {
        console.error('Error processing tokens from state:', err);
      } finally {
        setProcessingTokens(false);
      }
    };
    
    if (locationState?.fromReset) {
      processTokens();
    }
  }, [locationState, isPasswordRecovery, setIsValidResetLink, setMode]);

  return { processingTokens };
}
