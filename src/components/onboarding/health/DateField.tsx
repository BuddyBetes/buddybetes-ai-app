
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

const DateField: React.FC<DateFieldProps> = ({ value, onChange }) => {
  // Handle calendar date selection
  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="birthdate">Birthdate</Label>
      <div className="flex gap-2">
        <Input
          id="birthdate"
          type="text"
          value={value ? format(value, 'MMM dd, yyyy') : ''}
          placeholder="Select your birthdate"
          readOnly
          className="flex-1 cursor-pointer"
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-10 flex items-center justify-center p-0",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              disabled={(date) => date > new Date()}
              initialFocus
              captionLayout="dropdown-buttons"
              fromYear={1900}
              toYear={new Date().getFullYear()}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateField;
