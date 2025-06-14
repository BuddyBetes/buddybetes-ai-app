
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  status: 'free' | 'pending' | 'active' | 'expired' | 'cancelled';
  tier_id: string;
  expires_at: string | null;
  payment_method: string | null;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  tiers: SubscriptionTier[];
  hasFeatureAccess: (feature: string) => boolean;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setTiers(data || []);
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
    }
  };

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const hasFeatureAccess = (feature: string): boolean => {
    if (!subscription || !user) return false;
    
    if (subscription.status !== 'active') return false;
    
    if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
      return false;
    }

    const tier = tiers.find(t => t.id === subscription.tier_id);
    return tier?.features.includes(feature) || false;
  };

  const hasActiveSubscription = subscription?.status === 'active' && 
    (!subscription.expires_at || new Date(subscription.expires_at) > new Date());

  useEffect(() => {
    fetchTiers();
    fetchSubscription();
  }, [user]);

  const value: SubscriptionContextType = {
    subscription,
    tiers,
    hasFeatureAccess,
    hasActiveSubscription,
    isLoading,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
