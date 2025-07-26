
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, CreditCard, Smartphone } from 'lucide-react';
import Layout from '@/components/Layout';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/context/SubscriptionContext';
import { Badge } from '@/components/ui/badge';
import PaymentFlow from '@/components/subscription/PaymentFlow';

const Subscription = () => {
  const { tiers, subscription } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  const foundersFeatures = [
    'AI-powered glucose insights',
    'Advanced analytics & trends',
    'Extended data history',
    'Food image analysis',
    'Voice assistant premium',
    'Priority support',
    'Early access to new features'
  ];

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    setShowPaymentFlow(true);
  };

  if (showPaymentFlow && selectedTier) {
    return (
      <Layout>
        <AppHeader />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <PaymentFlow 
            tierId={selectedTier}
            onBack={() => setShowPaymentFlow(false)}
          />
        </div>
      </Layout>
    );
  }

  // Find Founders Access tier
  const foundersAccessTier = tiers.find(t => t.name === 'Founders Access');

  return (
    <Layout>
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Upgrade to Premium</h1>
            <p className="text-gray-600 mt-2">Unlock advanced features to better manage your diabetes</p>
          </motion.div>

          {subscription?.status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Payment pending verification - You'll receive access within 24 hours
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Discount Code Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-purple-700">
            <span className="text-sm font-medium">💡 Have a discount code? Apply it during checkout!</span>
          </div>
        </motion.div>

        {/* Founders Offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <Card className="border-2 border-gradient-to-r from-purple-500 to-pink-500 relative w-full">
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg whitespace-nowrap">
                Limited Time
              </Badge>
            </div>
            
            <CardHeader className="pb-4 pt-7 pr-28 w-full">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <Crown className="h-6 w-6 text-purple-500 flex-shrink-0" />
                <span className="whitespace-nowrap">Founders Access</span>
              </CardTitle>
              <div className="space-y-2 w-full">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">₱299</span>
                  <span className="text-base font-normal text-gray-600">/month</span>
                  <span className="text-lg text-gray-500 line-through ml-2">₱399</span>
                </div>
                <p className="text-sm text-gray-600">
                  Monthly subscription • Cancel anytime
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 w-full">
              <div className="grid gap-3">
                {foundersFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={() => handleSelectTier(foundersAccessTier?.id || '')}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg"
                  disabled={subscription?.status === 'active' || subscription?.status === 'pending'}
                >
                  {subscription?.status === 'active' ? 'Already Subscribed' :
                   subscription?.status === 'pending' ? 'Payment Pending' :
                   'Get Founders Access'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Accepted Payment Methods</h3>
          <div className="flex justify-center items-center gap-8">
            <div className="flex items-center gap-2 text-blue-600">
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Smartphone className="h-5 w-5" />
              <span className="font-medium">GCash</span>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">BPI</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Stripe: Instant activation • GCash/BPI: Manual verification within 24 hours
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Subscription;
