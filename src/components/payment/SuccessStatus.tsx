
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessStatusProps {
  onGoToSubscription: () => void;
}

const SuccessStatus: React.FC<SuccessStatusProps> = ({ onGoToSubscription }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">
          Your Founders Access has been activated. You now have access to all premium features.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you back to your subscription page...
        </p>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-green-800 font-medium mb-2">🎉 Welcome to Founders Access!</p>
        <div className="text-sm text-green-700 space-y-1">
          <p>✓ AI-powered glucose insights activated</p>
          <p>✓ Advanced analytics & trends unlocked</p>
          <p>✓ Food image analysis enabled</p>
          <p>✓ Priority support access granted</p>
        </div>
      </div>

      <Button onClick={onGoToSubscription} variant="outline">
        Go to Subscription Page
      </Button>
    </motion.div>
  );
};

export default SuccessStatus;
