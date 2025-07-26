
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
              <CardTitle className="text-xl">Apply Discount Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DiscountCodeInput
                onDiscountApplied={handleDiscountApplied}
                onDiscountRemoved={handleDiscountRemoved}
                appliedDiscount={appliedDiscount}
              />
              
              {appliedDiscount && appliedDiscount.discount_percentage < 100 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Great! You'll get {appliedDiscount.discount_percentage}% off your subscription.
                      Continue to payment to complete your purchase.
                    </p>
                  </div>
                  <Button 
                    onClick={handleContinueToPayment}
                    className="w-full"
                  >
                    Continue to Payment
                  </Button>
                </div>
              )}
              
              {!appliedDiscount && (
                <Button 
                  onClick={handleContinueToPayment}
                  variant="outline"
                  className="w-full"
                >
                  Skip and Continue to Payment
                </Button>
              )}
              
              {isProcessingFreeAccess && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Activating your free access...</p>
                </div>
              )}
              
              <Button 
                onClick={onBack}
                variant="ghost"
                className="w-full"
              >
                Back to Subscription Plans
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
          tierPrice={tier?.price}
          onBack={handleBackToMethodSelection}
          onContinue={handleContinueToUpload}
        />
      );

    case 'receipt-upload':
      return (
        <ReceiptUpload
          tierId={tierId}
          paymentMethod={paymentMethod! as 'gcash' | 'bpi'}
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
