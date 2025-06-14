
import React from 'react';
import Layout from '@/components/Layout';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';
import VerifyingStatus from '@/components/payment/VerifyingStatus';
import SuccessStatus from '@/components/payment/SuccessStatus';
import ErrorStatus from '@/components/payment/ErrorStatus';

const PaymentSuccess = () => {
  const {
    status,
    retryCount,
    isRetrying,
    sessionId,
    handleRetry,
    handleGoToSubscription
  } = usePaymentVerification();

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return <VerifyingStatus isRetrying={isRetrying} />;

      case 'success':
        return <SuccessStatus onGoToSubscription={handleGoToSubscription} />;

      case 'failed':
      case 'error':
        return (
          <ErrorStatus
            status={status}
            sessionId={sessionId}
            retryCount={retryCount}
            isRetrying={isRetrying}
            onRetry={handleRetry}
            onGoToSubscription={handleGoToSubscription}
          />
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
