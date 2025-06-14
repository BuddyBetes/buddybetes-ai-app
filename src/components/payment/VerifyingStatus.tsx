
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface VerifyingStatusProps {
  isRetrying: boolean;
}

const VerifyingStatus: React.FC<VerifyingStatusProps> = ({ isRetrying }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="flex justify-center">
        <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isRetrying ? 'Retrying Payment Verification...' : 'Verifying Your Payment...'}
        </h2>
        <p className="text-gray-600">
          Please wait while we confirm your payment with Stripe. This usually takes a few seconds.
        </p>
      </div>
    </motion.div>
  );
};

export default VerifyingStatus;
