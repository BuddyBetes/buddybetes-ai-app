
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LogFilters } from '@/types/filters';

interface CategoryFiltersProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleMealContextChange = (context: string, checked: boolean) => {
    const currentMealContext = filters.mealContext || [];
    let newMealContext;
    
    if (checked) {
      newMealContext = [...currentMealContext, context as any];
    } else {
      newMealContext = currentMealContext.filter(c => c !== context);
    }
    
    onFiltersChange({
      ...filters,
      mealContext: newMealContext.length > 0 ? newMealContext : undefined
    });
  };

  const handleMeasurementMethodChange = (method: string, checked: boolean) => {
    const currentMethods = filters.measurementMethod || [];
    let newMethods;
    
    if (checked) {
      newMethods = [...currentMethods, method as any];
    } else {
      newMethods = currentMethods.filter(m => m !== method);
    }
    
    onFiltersChange({
      ...filters,
      measurementMethod: newMethods.length > 0 ? newMethods : undefined
    });
  };

  const handleGlucoseCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.glucoseCategory || [];
    let newCategories;
    
    if (checked) {
      newCategories = [...currentCategories, category as any];
    } else {
      newCategories = currentCategories.filter(c => c !== category);
    }
    
    onFiltersChange({
      ...filters,
      glucoseCategory: newCategories.length > 0 ? newCategories : undefined
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Meal Context</label>
        <div className="space-y-3 sm:space-y-2">
          {[
            { value: 'before', label: 'Before Meal' },
            { value: 'after', label: 'After Meal' },
            { value: 'fasting', label: 'Fasting' }
          ].map(option => (
            <div key={option.value} className="flex items-center space-x-3 py-1">
              <Checkbox
                id={`meal-${option.value}`}
                checked={filters.mealContext?.includes(option.value as any) || false}
                onCheckedChange={(checked) => 
                  handleMealContextChange(option.value, checked as boolean)
                }
                className="h-4 w-4"
              />
              <label
                htmlFor={`meal-${option.value}`}
                className="text-sm font-normal leading-none cursor-pointer flex-1"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Measurement Method</label>
        <div className="space-y-3 sm:space-y-2">
          {[
            { value: 'finger_prick', label: 'Finger Prick' },
            { value: 'cgm', label: 'CGM' }
          ].map(option => (
            <div key={option.value} className="flex items-center space-x-3 py-1">
              <Checkbox
                id={`method-${option.value}`}
                checked={filters.measurementMethod?.includes(option.value as any) || false}
                onCheckedChange={(checked) => 
                  handleMeasurementMethodChange(option.value, checked as boolean)
                }
                className="h-4 w-4"
              />
              <label
                htmlFor={`method-${option.value}`}
                className="text-sm font-normal leading-none cursor-pointer flex-1"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Glucose Level</label>
        <div className="space-y-3 sm:space-y-2">
          {[
            { value: 'low', label: 'Low (<70 mg/dL)', color: 'text-red-600' },
            { value: 'normal', label: 'Normal (70-180 mg/dL)', color: 'text-green-600' },
            { value: 'high', label: 'High (>180 mg/dL)', color: 'text-orange-600' }
          ].map(option => (
            <div key={option.value} className="flex items-center space-x-3 py-1">
              <Checkbox
                id={`glucose-${option.value}`}
                checked={filters.glucoseCategory?.includes(option.value as any) || false}
                onCheckedChange={(checked) => 
                  handleGlucoseCategoryChange(option.value, checked as boolean)
                }
                className="h-4 w-4"
              />
              <label
                htmlFor={`glucose-${option.value}`}
                className={`text-sm font-normal leading-none cursor-pointer flex-1 ${option.color}`}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;
