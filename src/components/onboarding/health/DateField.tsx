
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface DateFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

const DateField: React.FC<DateFieldProps> = ({ value, onChange }) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    
    if (dateValue) {
      // Create Date object from input string
      const newDate = new Date(dateValue);
      
      // Check if date is valid
      if (!isNaN(newDate.getTime())) {
        onChange(newDate);
      }
    } else {
      // Handle case when input is cleared
      onChange(undefined);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="birthdate">Birthdate</Label>
      <Input
        id="birthdate"
        type="date"
        value={value ? format(value, 'yyyy-MM-dd') : ''}
        onChange={handleDateChange}
        max={format(new Date(), 'yyyy-MM-dd')}
      />
    </div>
  );
};

export default DateField;
