import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const discountCodeSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code must be less than 50 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, numbers, hyphens or underscores'),
  discount_percentage: z.number()
    .int('Must be a whole number')
    .min(1, 'Discount must be at least 1%')
    .max(100, 'Discount cannot exceed 100%'),
  duration_days: z.number().int().positive().optional().nullable(),
  max_uses: z.number().int().positive().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export type DiscountCodeFormData = z.infer<typeof discountCodeSchema>;

interface DiscountCodeFormProps {
  defaultValues?: Partial<DiscountCodeFormData>;
  onSubmit: (data: DiscountCodeFormData) => Promise<void>;
  isLoading?: boolean;
}

const DiscountCodeForm = ({ defaultValues, onSubmit, isLoading }: DiscountCodeFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DiscountCodeFormData>({
    resolver: zodResolver(discountCodeSchema),
    defaultValues: {
      is_active: true,
      ...defaultValues,
    },
  });

  const isActive = watch('is_active');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="code">Discount Code *</Label>
        <Input
          id="code"
          placeholder="SUMMER2024"
          className="uppercase"
          {...register('code')}
          onChange={(e) => setValue('code', e.target.value.toUpperCase())}
        />
        {errors.code && (
          <p className="text-sm text-destructive mt-1">{errors.code.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="discount_percentage">Discount Percentage (%) *</Label>
        <Input
          id="discount_percentage"
          type="number"
          min="1"
          max="100"
          {...register('discount_percentage', { valueAsNumber: true })}
        />
        {errors.discount_percentage && (
          <p className="text-sm text-destructive mt-1">{errors.discount_percentage.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration_days">Duration (Days)</Label>
          <Input
            id="duration_days"
            type="number"
            min="1"
            placeholder="Leave empty for permanent"
            {...register('duration_days', { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            How many days the discount is valid after redemption
          </p>
        </div>

        <div>
          <Label htmlFor="max_uses">Max Uses</Label>
          <Input
            id="max_uses"
            type="number"
            min="1"
            placeholder="Leave empty for unlimited"
            {...register('max_uses', { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum number of times this code can be used
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="expires_at">Expiration Date</Label>
        <Input
          id="expires_at"
          type="datetime-local"
          {...register('expires_at')}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave empty if the code never expires
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked)}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Code is Active
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Discount Code'}
        </Button>
      </div>
    </form>
  );
};

export default DiscountCodeForm;
