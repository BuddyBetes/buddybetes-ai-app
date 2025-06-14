
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentSuccessProps {
  onBack: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onBack }) => {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
        <p className="text-gray-600">
          Your payment has been submitted for verification. You'll receive access within 24 hours.
        </p>
      </div>
      <Button onClick={onBack} variant="outline">
        Back to Dashboard
      </Button>
    </motion.div>
  );
};

export default PaymentSuccess;
