
import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

const ReminderButton = () => {
  const [open, setOpen] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>('30');
  const { scheduleReminder } = useNotifications();
  const { toast } = useToast();

  const handleCreateReminder = async () => {
    const timeInMinutes = parseInt(reminderTime);
    if (isNaN(timeInMinutes)) return;
    
    await scheduleReminder(timeInMinutes);
    
    toast({
      title: "Reminder set",
      description: `You'll be reminded to check your glucose in ${timeInMinutes} minutes`,
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1.5"
        >
          <Clock size={16} />
          <span>Set Reminder</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Glucose Check Reminder</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Label className="mb-3 block">Remind me in:</Label>
          <RadioGroup 
            value={reminderTime} 
            onValueChange={setReminderTime}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="15" id="r1" />
              <Label htmlFor="r1">15 minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30" id="r2" />
              <Label htmlFor="r2">30 minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="60" id="r3" />
              <Label htmlFor="r3">1 hour</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="120" id="r4" />
              <Label htmlFor="r4">2 hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="240" id="r5" />
              <Label htmlFor="r5">4 hours</Label>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleCreateReminder}>Set Reminder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderButton;
