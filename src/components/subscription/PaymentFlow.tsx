
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Smartphone, CreditCard, Copy, Upload, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';

interface PaymentFlowProps {
  tierId: string;
  onBack: () => void;
}

type PaymentMethod = 'gcash' | 'bpi';

const PaymentFlow: React.FC<PaymentFlowProps> = ({ tierId, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { tiers, refreshSubscription } = useSubscription();

  const tier = tiers.find(t => t.id === tierId);
  
  const paymentDetails = {
    gcash: {
      name: 'GCash',
      number: '09123456789',
      qr: '/api/placeholder/200/200', // Placeholder for QR code
      icon: Smartphone,
      color: 'text-blue-600'
    },
    bpi: {
      name: 'BPI',
      number: '1234-5678-9012',
      qr: '/api/placeholder/200/200', // Placeholder for QR code  
      icon: CreditCard,
      color: 'text-red-600'
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!receiptFile || !paymentMethod || !user || !tier) {
      toast({
        title: "Missing information",
        description: "Please upload receipt and provide reference number",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload receipt file to storage (placeholder for now)
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const receiptUrl = `receipts/${fileName}`; // This would be actual file upload

      // Create subscription record
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          tier_id: tierId,
          status: 'pending',
          payment_method: paymentMethod,
          amount_paid: tier.price
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Create payment receipt record
      const { error: receiptError } = await supabase
        .from('payment_receipts')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionData.id,
          receipt_url: receiptUrl,
          payment_method: paymentMethod,
          reference_number: referenceNumber || null,
          amount: tier.price,
          verification_status: 'pending'
        });

      if (receiptError) throw receiptError;

      setIsCompleted(true);
      await refreshSubscription();
      
      toast({
        title: "Payment submitted!",
        description: "Your payment will be verified within 24 hours",
      });

    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isCompleted) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
          <p className="text-gray-600">
            Your payment has been submitted for verification. You'll receive access within 24 hours.
          </p>
        </div>
        <Button onClick={onBack} variant="outline">
          Back to Dashboard
        </Button>
      </motion.div>
    );
  }

  if (!paymentMethod) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">Choose Payment Method</h2>
        </div>

        <div className="grid gap-4">
          {Object.entries(paymentDetails).map(([method, details]) => {
            const Icon = details.icon;
            return (
              <Card
                key={method}
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200"
                onClick={() => setPaymentMethod(method as PaymentMethod)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Icon className={`h-8 w-8 ${details.color}`} />
                    <div>
                      <h3 className="text-lg font-semibold">{details.name}</h3>
                      <p className="text-sm text-gray-600">Pay via {details.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  const selectedPayment = paymentDetails[paymentMethod];
  const Icon = selectedPayment.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setPaymentMethod(null)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Pay via {selectedPayment.name}</h2>
      </div>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${selectedPayment.color}`} />
            {selectedPayment.name} Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg max-w-52 mx-auto">
              <img 
                src={selectedPayment.qr} 
                alt={`${selectedPayment.name} QR Code`} 
                className="w-full h-48 object-contain"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Account Number / Mobile Number</Label>
              <div className="flex items-center gap-2">
                <Input value={selectedPayment.number} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedPayment.number)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Amount to send: ₱{tier?.price}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Please send the exact amount
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Payment Receipt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="receipt">Receipt Screenshot/Photo</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="mt-1"
            />
            {receiptFile && (
              <p className="text-sm text-green-600 mt-1">
                ✓ {receiptFile.name} selected
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input
              id="reference"
              placeholder="Enter transaction reference number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmitPayment}
            disabled={!receiptFile || isUploading}
            className="w-full"
          >
            {isUploading ? 'Submitting...' : 'Submit Payment'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your payment will be manually verified within 24 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFlow;
