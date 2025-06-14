
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscription } from '@/context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

interface PaywallWrapperProps {
  children: React.ReactNode;
  feature: string;
  title?: string;
  description?: string;
  className?: string;
}

const PaywallWrapper: React.FC<PaywallWrapperProps> = ({
  children,
  feature,
  title = "Premium Feature",
  description = "Upgrade to access this feature",
  className = ""
}) => {
  const { hasFeatureAccess, isLoading } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
      </div>
    );
  }

  if (hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {/* Paywall overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg"
      >
        <Card className="p-6 text-center max-w-sm mx-4 border-2 border-gradient-to-r from-purple-500 to-pink-500">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="space-y-4"
          >
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 mb-4">{description}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-purple-700 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Founders Access - ₱999 only!
              </div>
              <p className="text-xs text-purple-600 mt-1">Limited time offer</p>
            </div>

            <Button 
              onClick={() => navigate('/subscription')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Upgrade Now
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaywallWrapper;
