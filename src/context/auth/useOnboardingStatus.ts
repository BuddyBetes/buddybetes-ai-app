
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useOnboardingStatus(userId: string | undefined, isPasswordRecovery: boolean) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId && !isPasswordRecovery) {
      checkOnboardingStatus(userId);
    }
  }, [userId, isPasswordRecovery]);

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

  return {
    hasCompletedOnboarding,
    setHasCompletedOnboarding
  };
}
