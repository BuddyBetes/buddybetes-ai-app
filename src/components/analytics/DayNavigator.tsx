
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DayNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
}

const DayNavigator: React.FC<DayNavigatorProps> = ({
  selectedDate,
  onDateChange,
  minDate,
  maxDate
}) => {
  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    if (previousDay >= minDate) {
      onDateChange(previousDay);
    }
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    if (nextDay <= maxDate) {
      onDateChange(nextDay);
    }
  };

  const isAtMinDate = selectedDate.toDateString() === minDate.toDateString();
  const isAtMaxDate = selectedDate.toDateString() === maxDate.toDateString();

  return (
    <div className="flex items-center gap-2 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousDay}
        disabled={isAtMinDate}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous Day
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
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
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNextDay}
        disabled={isAtMaxDate}
      >
        Next Day
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="ml-4 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(new Date())}
        >
          Today
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            onDateChange(yesterday);
          }}
        >
          Yesterday
        </Button>
      </div>
    </div>
  );
};

export default DayNavigator;
