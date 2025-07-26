import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiscountCodeInputProps {
  onDiscountApplied: (discount: {
    id: string;
    code: string;
    discount_percentage: number;
    duration_days: number | null;
  }) => void;
  onDiscountRemoved: () => void;
  appliedDiscount?: {
    id: string;
    code: string;
    discount_percentage: number;
    duration_days: number | null;
  } | null;
}

const DiscountCodeInput: React.FC<DiscountCodeInputProps> = ({
  onDiscountApplied,
  onDiscountRemoved,
  appliedDiscount
}) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateDiscountCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Please enter a discount code",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: { code: code.trim() }
      });

      if (error) throw error;

      if (data.valid) {
        onDiscountApplied(data.discount);
        setCode('');
        toast({
          title: "Discount code applied!",
          description: `${data.discount.discount_percentage}% off applied`
        });
      } else {
        toast({
          title: "Invalid discount code",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      toast({
        title: "Error validating discount code",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const removeDiscount = () => {
    onDiscountRemoved();
    toast({
      title: "Discount code removed"
    });
  };

  if (appliedDiscount) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700">
                    {appliedDiscount.code}
                  </span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {appliedDiscount.discount_percentage}% OFF
                  </Badge>
                </div>
                {appliedDiscount.duration_days && (
                  <p className="text-sm text-green-600 mt-1">
                    {appliedDiscount.duration_days} days access
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeDiscount}
              className="text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Tag className="h-4 w-4" />
            Have a discount code?
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter discount code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && validateDiscountCode()}
              disabled={isValidating}
              className="flex-1"
            />
            <Button
              onClick={validateDiscountCode}
              disabled={isValidating || !code.trim()}
              variant="outline"
              className="px-4"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscountCodeInput;