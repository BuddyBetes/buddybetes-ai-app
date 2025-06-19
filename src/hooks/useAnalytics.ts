
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAnalytics = () => {
  const { user } = useAuth();

  // Track page visits
  const trackPageVisit = useCallback(async (page: string) => {
    if (!user) return;

    try {
      await supabase.from('user_activity_logs').insert({
        user_id: user.id,
        action_type: 'page_visit',
        action_target: page,
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  }, [user]);

  // Track feature clicks
  const trackFeatureClick = useCallback(async (feature: string, metadata?: Record<string, any>) => {
    if (!user) return;

    try {
      await supabase.from('user_activity_logs').insert({
        user_id: user.id,
        action_type: 'feature_click',
        action_target: feature,
        metadata: { ...metadata, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error tracking feature click:', error);
    }
  }, [user]);

  // Track user session
  const trackSession = useCallback(async (action: 'start' | 'end') => {
    if (!user) return;

    try {
      if (action === 'start') {
        const { data, error } = await supabase.from('user_sessions').insert({
          user_id: user.id,
          device_type: getDeviceType(),
          browser: getBrowser(),
          ip_address: null // We don't track IP on client side
        }).select().single();

        if (!error && data) {
          sessionStorage.setItem('session_id', data.id);
        }
      } else if (action === 'end') {
        const sessionId = sessionStorage.getItem('session_id');
        if (sessionId) {
          await supabase
            .from('user_sessions')
            .update({ session_end: new Date().toISOString() })
            .eq('id', sessionId);
          sessionStorage.removeItem('session_id');
        }
      }
    } catch (error) {
      console.error('Error tracking session:', error);
    }
  }, [user]);

  return {
    trackPageVisit,
    trackFeatureClick,
    trackSession
  };
};

// Helper functions
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
  return 'desktop';
};

const getBrowser = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
};
