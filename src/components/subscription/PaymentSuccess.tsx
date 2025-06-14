
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentSuccessProps {
  onBack: () => void;
  paymentMethod?: 'stripe' | 'gcash' | 'bpi';
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onBack, paymentMethod = 'gcash' }) => {
  const isStripe = paymentMethod === 'stripe';

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isStripe ? 'Payment Successful!' : 'Payment Submitted!'}
        </h2>
        <p className="text-gray-600">
          {isStripe 
            ? 'Your Founders Access has been activated instantly. Welcome to premium features!'
            : 'Your payment has been submitted for verification. You\'ll receive access within 24 hours.'
          }
        </p>
      </div>
      
      {isStripe && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 font-medium mb-2">🎉 Welcome to Founders Access!</p>
          <div className="text-sm text-green-700 space-y-1">
            <p>✓ AI-powered glucose insights activated</p>
            <p>✓ Advanced analytics & trends unlocked</p>
            <p>✓ Food image analysis enabled</p>
            <p>✓ Priority support access granted</p>
          </div>
        </div>
      )}

      <Button onClick={onBack} className="w-full">
        {isStripe ? (
          <>
            Explore Premium Features
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          'Back to Dashboard'
        )}
      </Button>
    </motion.div>
  );
};

export default PaymentSuccess;
