
import React, { useState } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';

type PaymentMethod = 'gcash' | 'bpi';

interface ReceiptUploadProps {
  tierId: string;
  paymentMethod: PaymentMethod;
  effectivePrice?: number;
  appliedDiscount?: {
    id: string;
    code: string;
    discount_percentage: number;
    duration_days: number | null;
  } | null;
  onBack: () => void;
  onSuccess: () => void;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  tierId,
  paymentMethod,
  effectivePrice,
  appliedDiscount,
  onBack,
  onSuccess,
}) => {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { tiers, refreshSubscription } = useSubscription();

  const tier = tiers.find(t => t.id === tierId);

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

  const uploadReceiptToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .upload(fileName, file);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data.path;
  };

  const handleSubmitPayment = async () => {
    if (!receiptFile || !paymentMethod || !user || !tier) {
      toast({
        title: "Missing information",
        description: "Please upload receipt",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload receipt file to storage
      const receiptPath = await uploadReceiptToStorage(receiptFile);

      // Create subscription record
      const subscriptionData = {
        user_id: user.id,
        tier_id: tierId,
        status: 'pending' as const,
        payment_method: paymentMethod,
        amount_paid: effectivePrice || tier.price,
        expires_at: tier.duration_days ? null : null,
        starts_at: null
      };

      const { data: subscriptionResult, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Create payment receipt record
      const { error: receiptError } = await supabase
        .from('payment_receipts')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionResult.id,
          receipt_url: receiptPath,
          payment_method: paymentMethod,
          reference_number: referenceNumber || null,
          amount: effectivePrice || tier.price,
          verification_status: 'pending'
        });

      if (receiptError) throw receiptError;

      await refreshSubscription();
      onSuccess();
      
      toast({
        title: "Payment submitted!",
        description: "Your payment will be verified within 24 hours",
      });

    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "There was an error submitting your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Upload Receipt</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Receipt
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
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Enter transaction reference number"
              className="mt-1"
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

export default ReceiptUpload;
