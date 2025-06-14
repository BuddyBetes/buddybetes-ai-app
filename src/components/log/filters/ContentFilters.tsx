
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { LogFilters } from '@/types/filters';

interface ContentFiltersProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
}

const ContentFilters: React.FC<ContentFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleContentFilterChange = (key: keyof LogFilters, value: boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getCheckboxState = (value: boolean | undefined) => {
    if (value === undefined) return 'indeterminate';
    return value;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">Content Filters</label>
      
      {[
        { key: 'hasFood', label: 'Has Food Entry', icon: '🍽️' },
        { key: 'hasExercise', label: 'Has Exercise Entry', icon: '🏃' },
        { key: 'hasMedication', label: 'Has Medication Entry', icon: '💊' },
        { key: 'hasNotes', label: 'Has Notes', icon: '📝' },
        { key: 'hasNutrition', label: 'Has Nutrition Data', icon: '🥗' }
      ].map(option => {
        const currentValue = filters[option.key as keyof LogFilters] as boolean | undefined;
        
        return (
          <div key={option.key} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm">{option.icon}</span>
              <label className="text-sm font-normal">{option.label}</label>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleContentFilterChange(option.key as keyof LogFilters, true)}
                className={`px-2 py-1 text-xs rounded ${
                  currentValue === true 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleContentFilterChange(option.key as keyof LogFilters, undefined)}
                className={`px-2 py-1 text-xs rounded ${
                  currentValue === undefined 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Any
              </button>
              <button
                onClick={() => handleContentFilterChange(option.key as keyof LogFilters, false)}
                className={`px-2 py-1 text-xs rounded ${
                  currentValue === false 
                    ? 'bg-red-100 text-red-700 border border-red-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                No
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContentFilters;
