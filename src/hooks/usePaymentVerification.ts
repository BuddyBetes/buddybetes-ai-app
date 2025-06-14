
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/context/SubscriptionContext';
import { useIsPwa } from '@/hooks/use-pwa';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'error';

export const usePaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshSubscription } = useSubscription();
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const isPwa = useIsPwa();

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
        
        // Shorter redirect for PWA
        const redirectDelay = isPwa ? 2000 : 3000;
        setTimeout(() => {
          navigate('/subscription', { replace: true });
        }, redirectDelay);
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

  const handleGoToSubscription = () => {
    navigate('/subscription', { replace: true });
  };

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  return {
    status,
    retryCount,
    isRetrying,
    sessionId,
    handleRetry,
    handleGoToSubscription
  };
};
