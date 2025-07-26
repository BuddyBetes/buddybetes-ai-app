
import React, { useState } from 'react';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentDetails from './PaymentDetails';
import ReceiptUpload from './ReceiptUpload';
import PaymentSuccess from './PaymentSuccess';
import StripePayment from './StripePayment';
import DiscountCodeInput from './DiscountCodeInput';
import { useSubscription } from '@/context/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentFlowProps {
  tierId: string;
  onBack: () => void;
}

type PaymentMethod = 'gcash' | 'bpi' | 'stripe';
type FlowStep = 'discount-code' | 'method-selection' | 'payment-details' | 'receipt-upload' | 'stripe-payment' | 'success';

const PaymentFlow: React.FC<PaymentFlowProps> = ({ tierId, onBack }) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('discount-code');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string;
    code: string;
    discount_percentage: number;
    duration_days: number | null;
  } | null>(null);
  const [isProcessingFreeAccess, setIsProcessingFreeAccess] = useState(false);
  const { tiers, refreshSubscription } = useSubscription();
  const { toast } = useToast();

  const tier = tiers.find(t => t.id === tierId);
  
  // Calculate the effective price after discount
  const getEffectivePrice = () => {
    if (!tier || !appliedDiscount) return tier?.price;
    return tier.price * (1 - appliedDiscount.discount_percentage / 100);
  };

  const handleDiscountApplied = async (discount: {
    id: string;
    code: string;
    discount_percentage: number;
    duration_days: number | null;
  }) => {
    setAppliedDiscount(discount);
    
    // If 100% discount, apply immediately
    if (discount.discount_percentage === 100) {
      setIsProcessingFreeAccess(true);
      try {
        const { data, error } = await supabase.functions.invoke('apply-discount-code', {
          body: { 
            code: discount.code,
            tierId: tierId
          }
        });

        if (error) throw error;

        if (data.success) {
          await refreshSubscription();
          setCurrentStep('success');
          toast({
            title: "Free access activated!",
            description: `You now have ${discount.duration_days || 'lifetime'} premium access.`
          });
        }
      } catch (error) {
        console.error('Error applying discount code:', error);
        toast({
          title: "Error applying discount code",
          description: "Please try again",
          variant: "destructive"
        });
      } finally {
        setIsProcessingFreeAccess(false);
      }
    }
  };

  const handleDiscountRemoved = () => {
    setAppliedDiscount(null);
  };

  const handleContinueToPayment = () => {
    setCurrentStep('method-selection');
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'stripe') {
      setCurrentStep('stripe-payment');
    } else {
      setCurrentStep('payment-details');
    }
  };

  const handleBackToMethodSelection = () => {
    setPaymentMethod(null);
    setCurrentStep('method-selection');
  };

  const handleBackToDiscountCode = () => {
    setCurrentStep('discount-code');
  };

  const handleContinueToUpload = () => {
    setCurrentStep('receipt-upload');
  };

  const handleBackToDetails = () => {
    setCurrentStep('payment-details');
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('success');
  };

  switch (currentStep) {
    case 'discount-code':
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Complete Your Purchase</CardTitle>
              <p className="text-muted-foreground">
                Have a discount code? Apply it below or continue directly to payment.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary CTA - Continue to Payment */}
              <div className="space-y-3">
                <Button 
                  onClick={handleContinueToPayment}
                  size="lg"
                  className="w-full"
                >
                  Continue to Payment
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout powered by Stripe
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or apply discount code
                  </span>
                </div>
              </div>

              {/* Discount Code Section */}
              <div className="space-y-4">
                <DiscountCodeInput
                  onDiscountApplied={handleDiscountApplied}
                  onDiscountRemoved={handleDiscountRemoved}
                  appliedDiscount={appliedDiscount}
                />
                
                {appliedDiscount && appliedDiscount.discount_percentage < 100 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">
                        🎉 Discount Applied! You'll save {appliedDiscount.discount_percentage}% 
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Continue to payment to complete your discounted purchase.
                      </p>
                    </div>
                    <Button 
                      onClick={handleContinueToPayment}
                      className="w-full"
                    >
                      Continue to Payment ({appliedDiscount.discount_percentage}% off)
                    </Button>
                  </div>
                )}
                
                {isProcessingFreeAccess && (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-3">Activating your free access...</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={onBack}
                variant="ghost"
                className="w-full"
              >
                ← Back to Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      );

    case 'method-selection':
      return (
        <PaymentMethodSelector
          onBack={handleBackToDiscountCode}
          onSelectMethod={handleSelectMethod}
          appliedDiscount={appliedDiscount}
        />
      );

    case 'stripe-payment':
      return (
        <StripePayment
          tierId={tierId}
          discountCodeId={appliedDiscount?.id}
          onBack={handleBackToMethodSelection}
          onSuccess={handlePaymentSuccess}
        />
      );

    case 'payment-details':
      return (
        <PaymentDetails
          paymentMethod={paymentMethod! as 'gcash' | 'bpi'}
          tierPrice={getEffectivePrice()}
          appliedDiscount={appliedDiscount}
          onBack={handleBackToMethodSelection}
          onContinue={handleContinueToUpload}
        />
      );

    case 'receipt-upload':
      return (
        <ReceiptUpload
          tierId={tierId}
          paymentMethod={paymentMethod! as 'gcash' | 'bpi'}
          effectivePrice={getEffectivePrice()}
          appliedDiscount={appliedDiscount}
          onBack={handleBackToDetails}
          onSuccess={handlePaymentSuccess}
        />
      );

    case 'success':
      return (
        <PaymentSuccess 
          onBack={onBack} 
          paymentMethod={paymentMethod || 'gcash'}
        />
      );

    default:
      return null;
  }
};

export default PaymentFlow;
