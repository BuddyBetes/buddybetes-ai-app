import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DiscountCodeForm, { DiscountCodeFormData } from './DiscountCodeForm';

interface DiscountCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DiscountCodeFormData) => Promise<void>;
  defaultValues?: Partial<DiscountCodeFormData>;
  title: string;
  isLoading?: boolean;
}

const DiscountCodeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  title,
  isLoading,
}: DiscountCodeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DiscountCodeForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DiscountCodeDialog;
