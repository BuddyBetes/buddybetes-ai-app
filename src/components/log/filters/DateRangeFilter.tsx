
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LogFilters } from '@/types/filters';

interface DateRangeFilterProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
  filterPresets: Array<{
    label: string;
    value: string;
    getDateRange: () => { from: Date; to: Date };
  }>;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ 
  filters, 
  onFiltersChange, 
  filterPresets 
}) => {
  const handleQuickDateChange = (value: string) => {
    if (value === 'custom') {
      onFiltersChange({
        ...filters,
        quickDate: undefined,
        dateRange: {}
      });
    } else {
      onFiltersChange({
        ...filters,
        quickDate: value as any,
        dateRange: {}
      });
    }
  };

  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      quickDate: undefined,
      dateRange: {
        ...filters.dateRange,
        [field]: date
      }
    });
  };

  // Use shorter format on mobile
  const formatDateForDisplay = (date: Date) => {
    return format(date, window.innerWidth < 640 ? "MM/dd/yy" : "PPP");
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">Date Range</label>
        <Select
          value={filters.quickDate || 'custom'}
          onValueChange={handleQuickDateChange}
        >
          <SelectTrigger className="w-full h-9">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            {filterPresets.map(preset => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!filters.quickDate && (
        <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 text-xs sm:text-sm",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">
                    {filters.dateRange.from ? (
                      formatDateForDisplay(filters.dateRange.from)
                    ) : (
                      "Pick date"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from}
                  onSelect={(date) => handleDateRangeChange('from', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 text-xs sm:text-sm",
                    !filters.dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">
                    {filters.dateRange.to ? (
                      formatDateForDisplay(filters.dateRange.to)
                    ) : (
                      "Pick date"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to}
                  onSelect={(date) => handleDateRangeChange('to', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
