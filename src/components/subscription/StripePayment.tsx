
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/context/SubscriptionContext';

interface StripePaymentProps {
  tierId: string;
  onBack: () => void;
  onSuccess: () => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({ tierId, onBack, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { refreshSubscription } = useSubscription();

  const handleStripeCheckout = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { tierId }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Stripe",
          description: "Complete your payment in the new tab, then return here.",
        });
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "Failed to create Stripe checkout session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (!sessionId) {
      toast({
        title: "No Session Found",
        description: "Please complete the checkout process first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data?.success) {
        await refreshSubscription();
        toast({
          title: "Payment Successful!",
          description: "Your premium access has been activated.",
        });
        onSuccess();
      } else {
        toast({
          title: "Payment Verification Failed",
          description: data?.error || "Unable to verify payment. Please contact support.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify payment. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Pay with Stripe</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <CreditCard className="h-5 w-5" />
            Secure Stripe Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Founders Access - Lifetime</h3>
            <p className="text-2xl font-bold text-blue-900">₱999</p>
            <p className="text-sm text-blue-700 mt-1">
              Secure payment processed by Stripe
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleStripeCheckout}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                "Creating checkout..."
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with Stripe
                </>
              )}
            </Button>

            <Button 
              onClick={handleVerifyPayment}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Payment (if you completed checkout)"}
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Secure payment processing by Stripe</p>
            <p>• Supports all major credit and debit cards</p>
            <p>• Instant activation upon successful payment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripePayment;
