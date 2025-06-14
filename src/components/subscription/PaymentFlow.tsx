
import React, { useState } from 'react';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentDetails from './PaymentDetails';
import ReceiptUpload from './ReceiptUpload';
import PaymentSuccess from './PaymentSuccess';
import { useSubscription } from '@/context/SubscriptionContext';

interface PaymentFlowProps {
  tierId: string;
  onBack: () => void;
}

type PaymentMethod = 'gcash' | 'bpi';
type FlowStep = 'method-selection' | 'payment-details' | 'receipt-upload' | 'success';

const PaymentFlow: React.FC<PaymentFlowProps> = ({ tierId, onBack }) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('method-selection');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const { tiers } = useSubscription();

  const tier = tiers.find(t => t.id === tierId);

  const handleSelectMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setCurrentStep('payment-details');
  };

  const handleBackToMethodSelection = () => {
    setPaymentMethod(null);
    setCurrentStep('method-selection');
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
    case 'method-selection':
      return (
        <PaymentMethodSelector
          onBack={onBack}
          onSelectMethod={handleSelectMethod}
        />
      );

    case 'payment-details':
      return (
        <PaymentDetails
          paymentMethod={paymentMethod!}
          tierPrice={tier?.price}
          onBack={handleBackToMethodSelection}
          onContinue={handleContinueToUpload}
        />
      );

    case 'receipt-upload':
      return (
        <ReceiptUpload
          tierId={tierId}
          paymentMethod={paymentMethod!}
          onBack={handleBackToDetails}
          onSuccess={handlePaymentSuccess}
        />
      );

    case 'success':
      return <PaymentSuccess onBack={onBack} />;

    default:
      return null;
  }
};

export default PaymentFlow;
