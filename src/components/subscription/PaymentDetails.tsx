
import React from 'react';
import { Copy, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'gcash' | 'bpi';

interface PaymentDetailsProps {
  paymentMethod: PaymentMethod;
  tierPrice?: number;
  onBack: () => void;
  onContinue: () => void;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  paymentMethod,
  tierPrice,
  onBack,
  onContinue,
}) => {
  const { toast } = useToast();

  const paymentDetails = {
    gcash: {
      name: 'GCash',
      number: '09283563257',
      qr: '/gcash-qr.png',
      color: 'text-blue-600'
    },
    bpi: {
      name: 'BPI',
      number: '1129396004',
      qr: '/bpi-qr.png',
      color: 'text-red-600'
    }
  };

  const selectedPayment = paymentDetails[paymentMethod];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Pay via {selectedPayment.name}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${selectedPayment.color}`}>
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
                <strong>Amount to send: ₱{tierPrice}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Please send the exact amount
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onContinue} className="w-full">
        Continue to Receipt Upload
      </Button>
    </div>
  );
};

export default PaymentDetails;
