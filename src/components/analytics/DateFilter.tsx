
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateFilterProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
}

const DateFilter: React.FC<DateFilterProps> = ({ 
  selectedDate, 
  onDateChange, 
  minDate, 
  maxDate 
}) => {
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    if (previousDay >= minDate) {
      onDateChange(previousDay);
    }
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    if (nextDay <= maxDate) {
      onDateChange(nextDay);
    }
  };

  const goToToday = () => {
    const today = new Date();
    if (today >= minDate && today <= maxDate) {
      onDateChange(today);
    } else {
      onDateChange(maxDate); // Go to latest available date
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousDay}
        disabled={selectedDate <= minDate}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            disabled={(date) => date < minDate || date > maxDate}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        onClick={goToNextDay}
        disabled={selectedDate >= maxDate}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={goToToday}
      >
        Today
      </Button>
    </div>
  );
};

export default DateFilter;
