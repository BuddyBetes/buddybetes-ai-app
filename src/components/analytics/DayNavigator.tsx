
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DayNavigatorProps {
  selectedDateString: string;
  onDateChange: (dateString: string) => void;
  availableDates: string[];
}

const DayNavigator: React.FC<DayNavigatorProps> = ({
  selectedDateString,
  onDateChange,
  availableDates
}) => {
  // Convert string dates to Date objects for calendar component
  const selectedDate = new Date(selectedDateString + 'T12:00:00.000Z');
  const availableDateObjects = availableDates.map(dateStr => new Date(dateStr + 'T12:00:00.000Z'));

  const getNextAvailableDate = (direction: 'next' | 'previous') => {
    const sortedDates = [...availableDates].sort();
    const currentIndex = sortedDates.findIndex(date => date === selectedDateString);
    
    if (direction === 'next') {
      return currentIndex < sortedDates.length - 1 ? sortedDates[currentIndex + 1] : null;
    } else {
      return currentIndex > 0 ? sortedDates[currentIndex - 1] : null;
    }
  };

  const handlePreviousDay = () => {
    const previousDate = getNextAvailableDate('previous');
    if (previousDate) {
      onDateChange(previousDate);
    }
  };

  const handleNextDay = () => {
    const nextDate = getNextAvailableDate('next');
    if (nextDate) {
      onDateChange(nextDate);
    }
  };

  const isDateAvailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return availableDates.includes(dateString);
  };

  const canGoPrevious = getNextAvailableDate('previous') !== null;
  const canGoNext = getNextAvailableDate('next') !== null;

  const getMostRecentDate = () => {
    if (availableDates.length === 0) return null;
    return [...availableDates].sort().reverse()[0];
  };

  const getSecondMostRecentDate = () => {
    if (availableDates.length < 2) return null;
    const sorted = [...availableDates].sort().reverse();
    return sorted[1];
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      if (availableDates.includes(dateString)) {
        onDateChange(dateString);
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 overflow-x-auto">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousDay}
          disabled={!canGoPrevious}
          className="h-9"
        >
          <ChevronLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] sm:w-[240px] justify-start text-left font-normal h-9",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
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
          className="h-9"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 sm:ml-1" />
        </Button>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const mostRecent = getMostRecentDate();
            if (mostRecent) onDateChange(mostRecent);
          }}
          disabled={!getMostRecentDate()}
          className="h-9"
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
          className="h-9"
        >
          Previous
        </Button>
      </div>
    </div>
  );
};

export default DayNavigator;
