
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStatusProps {
  status: 'failed' | 'error';
  sessionId: string | null;
  retryCount: number;
  isRetrying: boolean;
  onRetry: () => void;
  onGoToSubscription: () => void;
}

const ErrorStatus: React.FC<ErrorStatusProps> = ({
  status,
  sessionId,
  retryCount,
  isRetrying,
  onRetry,
  onGoToSubscription
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="flex justify-center">
        <AlertCircle className="h-16 w-16 text-red-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'failed' ? 'Payment Verification Failed' : 'Verification Error'}
        </h2>
        <p className="text-gray-600 mb-4">
          {status === 'failed' 
            ? 'We were unable to verify your payment. Your payment may still be processing.'
            : 'Something went wrong while verifying your payment. Please try again.'
          }
        </p>
        {!sessionId && (
          <p className="text-sm text-red-600 mb-4">
            No payment session found. Please make sure you completed the checkout process.
          </p>
        )}
      </div>
      <div className="space-y-3">
        {retryCount < 3 && sessionId && (
          <Button 
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again ({3 - retryCount} attempts left)
              </>
            )}
          </Button>
        )}
        <Button 
          onClick={onGoToSubscription} 
          variant="outline"
          className="w-full"
        >
          Back to Subscription
        </Button>
      </div>
      <div className="text-sm text-gray-500 space-y-1">
        <p>If you continue to experience issues:</p>
        <p>• Check your email for a payment confirmation</p>
        <p>• Contact our support team with your order details</p>
        <p>• Your payment may take a few minutes to process</p>
      </div>
    </motion.div>
  );
};

export default ErrorStatus;
