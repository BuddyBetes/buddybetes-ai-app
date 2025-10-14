import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm, { EventFormData } from './EventForm';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  defaultValues?: Partial<EventFormData>;
  title: string;
  isLoading?: boolean;
}

const EventDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  title,
  isLoading,
}: EventDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <EventForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
