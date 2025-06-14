
import React from 'react';
import { Input } from '@/components/ui/input';
import { LogFilters } from '@/types/filters';

interface GlucoseRangeFilterProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
}

const GlucoseRangeFilter: React.FC<GlucoseRangeFilterProps> = ({ 
  filters, 
  onFiltersChange 
}) => {
  const handleRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    
    onFiltersChange({
      ...filters,
      glucoseRange: {
        ...filters.glucoseRange,
        [field]: numValue
      }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">Glucose Range (mg/dL)</label>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-2">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Min</label>
          <Input
            type="number"
            placeholder="Min"
            value={filters.glucoseRange.min || ''}
            onChange={(e) => handleRangeChange('min', e.target.value)}
            className="text-sm h-9"
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Max</label>
          <Input
            type="number"
            placeholder="Max"
            value={filters.glucoseRange.max || ''}
            onChange={(e) => handleRangeChange('max', e.target.value)}
            className="text-sm h-9"
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Normal range:</span>
          <span>70-180 mg/dL</span>
        </div>
      </div>
    </div>
  );
};

export default GlucoseRangeFilter;
