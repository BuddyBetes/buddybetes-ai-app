
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsPwa } from '@/hooks/use-pwa';

interface StripePaymentProps {
  tierId: string;
  discountCodeId?: string;
  onBack: () => void;
  onSuccess: () => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({ tierId, discountCodeId, onBack, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isPwa = useIsPwa();

  const handleStripeCheckout = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { tierId, discountCodeId }
      });

      if (error) throw error;

      if (data?.url) {
        toast({
          title: "Redirecting to Stripe",
          description: isPwa ? "Redirecting to secure checkout..." : "Opening secure checkout in a new tab...",
        });
        
        if (isPwa) {
          // In PWA, redirect in the same tab for better compatibility
          window.location.href = data.url;
        } else {
          // For regular web browsers, try to open in new tab
          const newWindow = window.open(data.url, '_blank');
          
          // Fallback: if popup was blocked, redirect in same tab
          if (!newWindow) {
            toast({
              title: "Popup Blocked",
              description: "Redirecting to Stripe checkout...",
            });
            window.location.href = data.url;
          }
        }
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
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Founders Access - Lifetime</h3>
            <p className="text-2xl font-bold text-blue-900">₱999</p>
            <p className="text-sm text-blue-700 mt-1">
              Secure payment processed by Stripe
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleStripeCheckout}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating checkout...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with Stripe
                  {!isPwa && <ExternalLink className="ml-2 h-4 w-4" />}
                </>
              )}
            </Button>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>1. Click "Pay with Stripe" to {isPwa ? 'go to' : 'open'} secure checkout</p>
                <p>2. Complete your payment using any major credit/debit card</p>
                <p>3. You'll be automatically redirected back with confirmation</p>
                <p>4. Your premium access will be activated instantly</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• 256-bit SSL encryption for secure payments</p>
            <p>• Supports Visa, Mastercard, American Express, and more</p>
            <p>• Instant activation upon successful payment</p>
            <p>• 30-day money-back guarantee</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripePayment;
