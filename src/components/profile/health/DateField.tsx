
import React from 'react';
import { Input } from '@/components/ui/input';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import HealthDataFormField from './HealthDataFormField';

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const DateField: React.FC<DateFieldProps> = ({ value, onChange }) => {
  // Convert string date to Date object for calendar
  const dateValue = value ? new Date(value) : undefined;
  
  // Handle calendar date selection
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onChange(formattedDate);
    }
  };

  return (
    <HealthDataFormField label="Birthdate">
      <div className="flex gap-2">
        <Input
          id="birthdate_input"
          name="birthdate_input"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-10 flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleCalendarSelect}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </HealthDataFormField>
  );
};

export default DateField;
