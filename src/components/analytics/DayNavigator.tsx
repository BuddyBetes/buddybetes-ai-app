
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
  availableDates: Date[];
}

const DayNavigator: React.FC<DayNavigatorProps> = ({
  selectedDate,
  onDateChange,
  availableDates
}) => {
  const getNextAvailableDate = (currentDate: Date, direction: 'next' | 'previous') => {
    const sortedDates = [...availableDates].sort((a, b) => a.getTime() - b.getTime());
    const currentIndex = sortedDates.findIndex(date => 
      date.toDateString() === currentDate.toDateString()
    );
    
    if (direction === 'next') {
      return currentIndex < sortedDates.length - 1 ? sortedDates[currentIndex + 1] : null;
    } else {
      return currentIndex > 0 ? sortedDates[currentIndex - 1] : null;
    }
  };

  const handlePreviousDay = () => {
    const previousDate = getNextAvailableDate(selectedDate, 'previous');
    if (previousDate) {
      onDateChange(previousDate);
    }
  };

  const handleNextDay = () => {
    const nextDate = getNextAvailableDate(selectedDate, 'next');
    if (nextDate) {
      onDateChange(nextDate);
    }
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      availableDate.toDateString() === date.toDateString()
    );
  };

  const canGoPrevious = getNextAvailableDate(selectedDate, 'previous') !== null;
  const canGoNext = getNextAvailableDate(selectedDate, 'next') !== null;

  const getMostRecentDate = () => {
    if (availableDates.length === 0) return null;
    return [...availableDates].sort((a, b) => b.getTime() - a.getTime())[0];
  };

  const getSecondMostRecentDate = () => {
    if (availableDates.length < 2) return null;
    const sorted = [...availableDates].sort((a, b) => b.getTime() - a.getTime());
    return sorted[1];
  };

  return (
    <div className="flex items-center gap-2 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousDay}
        disabled={!canGoPrevious}
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
            disabled={(date) => !isDateAvailable(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNextDay}
        disabled={!canGoNext}
      >
        Next Day
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="ml-4 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const mostRecent = getMostRecentDate();
            if (mostRecent) onDateChange(mostRecent);
          }}
          disabled={!getMostRecentDate()}
        >
          Latest
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const secondMostRecent = getSecondMostRecentDate();
            if (secondMostRecent) onDateChange(secondMostRecent);
          }}
          disabled={!getSecondMostRecentDate()}
        >
          Previous
        </Button>
      </div>
    </div>
  );
};

export default DayNavigator;
