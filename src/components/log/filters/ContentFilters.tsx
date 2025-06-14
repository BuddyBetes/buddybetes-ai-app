
import React from 'react';
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

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">Content Filters</label>
      
      <div className="space-y-3 sm:space-y-2">
        {[
          { key: 'hasFood', label: 'Has Food Entry', icon: '🍽️' },
          { key: 'hasExercise', label: 'Has Exercise Entry', icon: '🏃' },
          { key: 'hasMedication', label: 'Has Medication Entry', icon: '💊' },
          { key: 'hasNotes', label: 'Has Notes', icon: '📝' },
          { key: 'hasNutrition', label: 'Has Nutrition Data', icon: '🥗' }
        ].map(option => {
          const currentValue = filters[option.key as keyof LogFilters] as boolean | undefined;
          
          return (
            <div key={option.key} className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
              {/* Label section */}
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-sm">{option.icon}</span>
                <label className="text-sm font-normal">{option.label}</label>
              </div>
              
              {/* Button group - mobile: full width, desktop: compact */}
              <div className="flex w-full sm:w-auto">
                <button
                  onClick={() => handleContentFilterChange(option.key as keyof LogFilters, true)}
                  className={`flex-1 sm:flex-none px-3 sm:px-2 py-2 sm:py-1 text-sm sm:text-xs rounded-l border ${
                    currentValue === true 
                      ? 'bg-green-100 text-green-700 border-green-300 z-10' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleContentFilterChange(option.key as keyof LogFilters, undefined)}
                  className={`flex-1 sm:flex-none px-3 sm:px-2 py-2 sm:py-1 text-sm sm:text-xs border-t border-b -ml-px ${
                    currentValue === undefined 
                      ? 'bg-blue-100 text-blue-700 border-blue-300 z-10' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
                  }`}
                >
                  Any
                </button>
                <button
                  onClick={() => handleContentFilterChange(option.key as keyof LogFilters, false)}
                  className={`flex-1 sm:flex-none px-3 sm:px-2 py-2 sm:py-1 text-sm sm:text-xs rounded-r border -ml-px ${
                    currentValue === false 
                      ? 'bg-red-100 text-red-700 border-red-300 z-10' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentFilters;
