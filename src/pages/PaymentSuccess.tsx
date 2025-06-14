
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import Layout from '@/components/Layout';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/context/SubscriptionContext';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'error';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshSubscription } = useSubscription();
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const sessionId = searchParams.get('session_id');

  const verifyPayment = async (retry = false) => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    try {
      if (retry) setIsRetrying(true);
      
      const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data?.success) {
        await refreshSubscription();
        setStatus('success');
        toast({
          title: "Payment Successful!",
          description: "Your Founders Access has been activated.",
        });
        
        // Redirect to subscription page after 3 seconds
        setTimeout(() => {
          navigate('/subscription', { replace: true });
        }, 3000);
      } else {
        setStatus('failed');
        toast({
          title: "Payment Verification Failed",
          description: data?.error || "Unable to verify payment. Please contact support.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      toast({
        title: "Verification Error",
        description: "Failed to verify payment. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRetry = async () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setStatus('verifying');
      await verifyPayment(true);
    }
  };

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
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

      case 'success':
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
            <Button onClick={() => navigate('/subscription')} variant="outline">
              Go to Subscription Page
            </Button>
          </motion.div>
        );

      case 'failed':
      case 'error':
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
                  onClick={handleRetry}
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
                onClick={() => navigate('/subscription')} 
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

      default:
        return null;
    }
  };

  return (
    <Layout>
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
