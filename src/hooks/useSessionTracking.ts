
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAnalytics } from './useAnalytics';

export const useSessionTracking = () => {
  const { user } = useAuth();
  const { trackSession } = useAnalytics();

  useEffect(() => {
    if (user) {
      trackSession('start');

      const handleBeforeUnload = () => {
        trackSession('end');
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        trackSession('end');
      };
    }
  }, [user, trackSession]);
};
