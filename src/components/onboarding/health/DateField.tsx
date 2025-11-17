
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

const DateField: React.FC<DateFieldProps> = ({ value, onChange }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Parse existing date value into components
  useEffect(() => {
    if (value) {
      setDay(value.getDate().toString().padStart(2, '0'));
      setMonth((value.getMonth() + 1).toString().padStart(2, '0'));
      setYear(value.getFullYear().toString());
    } else {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [value]);

  // Combine day, month, year into Date object
  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
    if (newDay && newMonth && newYear) {
      const dayNum = parseInt(newDay);
      const monthNum = parseInt(newMonth);
      const yearNum = parseInt(newYear);
      
      // Basic validation
      if (dayNum >= 1 && dayNum <= 31 && 
          monthNum >= 1 && monthNum <= 12 && 
          yearNum >= 1900 && yearNum <= new Date().getFullYear()) {
        
        // Create date and check if it's valid (handles Feb 30, etc.)
        const newDate = new Date(yearNum, monthNum - 1, dayNum);
        if (newDate.getDate() === dayNum && 
            newDate.getMonth() === monthNum - 1 && 
            newDate.getFullYear() === yearNum) {
          onChange(newDate);
          return;
        }
      }
    }
    
    // If we get here, the date is invalid or incomplete
    if (!newDay && !newMonth && !newYear) {
      onChange(undefined);
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDay(value);
    updateDate(value, month, year);
    
    // Auto-focus next field when complete
    if (value.length === 2) {
      const monthInput = document.getElementById('birth-month');
      monthInput?.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMonth(value);
    updateDate(day, value, year);
    
    // Auto-focus next field when complete
    if (value.length === 2) {
      const yearInput = document.getElementById('birth-year');
      yearInput?.focus();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(value);
    updateDate(day, month, value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="birth-day">Birthdate *</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id="birth-day"
            type="text"
            inputMode="numeric"
            value={day}
            onChange={handleDayChange}
            placeholder="DD"
            className="text-center"
            maxLength={2}
          />
          <div className="text-xs text-gray-500 mt-1 text-center">Day</div>
        </div>
        
        <div className="flex-1">
          <Input
            id="birth-month"
            type="text"
            inputMode="numeric"
            value={month}
            onChange={handleMonthChange}
            placeholder="MM"
            className="text-center"
            maxLength={2}
          />
          <div className="text-xs text-gray-500 mt-1 text-center">Month</div>
        </div>
        
        <div className="flex-1">
          <Input
            id="birth-year"
            type="text"
            inputMode="numeric"
            value={year}
            onChange={handleYearChange}
            placeholder="YYYY"
            className="text-center"
            maxLength={4}
          />
          <div className="text-xs text-gray-500 mt-1 text-center">Year</div>
        </div>
      </div>
    </div>
  );
};

export default DateField;
