
import React from 'react';
import { Smartphone, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type PaymentMethod = 'gcash' | 'bpi';

interface PaymentMethodSelectorProps {
  onBack: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onBack,
  onSelectMethod,
}) => {
  const paymentDetails = {
    gcash: {
      name: 'GCash',
      icon: Smartphone,
      color: 'text-blue-600'
    },
    bpi: {
      name: 'BPI',
      icon: CreditCard,
      color: 'text-red-600'
    }
  };

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
              onClick={() => onSelectMethod(method as PaymentMethod)}
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
};

export default PaymentMethodSelector;
