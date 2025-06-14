
import { useState, useMemo } from 'react';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { GlucoseLog } from '@/types/logs';
import { LogFilters } from '@/types/filters';

const initialFilters: LogFilters = {
  dateRange: {},
  glucoseRange: {},
};

export const useLogFilters = (logs: GlucoseLog[]) => {
  const [filters, setFilters] = useState<LogFilters>(initialFilters);

  const filterPresets = [
    {
      label: 'Today',
      value: 'today',
      getDateRange: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(new Date())
      })
    },
    {
      label: 'Yesterday',
      value: 'yesterday',
      getDateRange: () => ({
        from: startOfDay(subDays(new Date(), 1)),
        to: endOfDay(subDays(new Date(), 1))
      })
    },
    {
      label: 'Last 7 days',
      value: 'last7days',
      getDateRange: () => ({
        from: startOfDay(subDays(new Date(), 7)),
        to: endOfDay(new Date())
      })
    },
    {
      label: 'Last 30 days',
      value: 'last30days',
      getDateRange: () => ({
        from: startOfDay(subDays(new Date(), 30)),
        to: endOfDay(new Date())
      })
    },
    {
      label: 'This month',
      value: 'thisMonth',
      getDateRange: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      })
    }
  ];

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Date filtering
      if (filters.quickDate) {
        const preset = filterPresets.find(p => p.value === filters.quickDate);
        if (preset) {
          const { from, to } = preset.getDateRange();
          if (log.timestamp < from || log.timestamp > to) return false;
        }
      } else if (filters.dateRange.from || filters.dateRange.to) {
        if (filters.dateRange.from && log.timestamp < filters.dateRange.from) return false;
        if (filters.dateRange.to && log.timestamp > filters.dateRange.to) return false;
      }

      // Meal context filtering
      if (filters.mealContext && filters.mealContext.length > 0) {
        if (!log.mealContext || !filters.mealContext.includes(log.mealContext)) return false;
      }

      // Measurement method filtering
      if (filters.measurementMethod && filters.measurementMethod.length > 0) {
        if (!log.glucoseMeasurementMethod || !filters.measurementMethod.includes(log.glucoseMeasurementMethod)) return false;
      }

      // Glucose range filtering
      if (log.glucoseLevel !== undefined) {
        if (filters.glucoseRange.min !== undefined && log.glucoseLevel < filters.glucoseRange.min) return false;
        if (filters.glucoseRange.max !== undefined && log.glucoseLevel > filters.glucoseRange.max) return false;
      }

      // Glucose category filtering
      if (filters.glucoseCategory && filters.glucoseCategory.length > 0 && log.glucoseLevel !== undefined) {
        const category = log.glucoseLevel < 70 ? 'low' : log.glucoseLevel > 180 ? 'high' : 'normal';
        if (!filters.glucoseCategory.includes(category)) return false;
      }

      // Content filters
      if (filters.hasFood === true && !log.food) return false;
      if (filters.hasFood === false && log.food) return false;
      
      if (filters.hasExercise === true && !log.exercise) return false;
      if (filters.hasExercise === false && log.exercise) return false;
      
      if (filters.hasMedication === true && !log.medication) return false;
      if (filters.hasMedication === false && log.medication) return false;
      
      if (filters.hasNotes === true && !log.notes) return false;
      if (filters.hasNotes === false && log.notes) return false;

      // Nutrition filtering
      if (filters.hasNutrition === true) {
        const hasNutritionData = log.calories !== undefined || log.protein !== undefined || 
                                log.carbs !== undefined || log.fat !== undefined;
        if (!hasNutritionData) return false;
      }
      if (filters.hasNutrition === false) {
        const hasNutritionData = log.calories !== undefined || log.protein !== undefined || 
                                log.carbs !== undefined || log.fat !== undefined;
        if (hasNutritionData) return false;
      }

      return true;
    });
  }, [logs, filters, filterPresets]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.quickDate) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.mealContext && filters.mealContext.length > 0) count++;
    if (filters.measurementMethod && filters.measurementMethod.length > 0) count++;
    if (filters.glucoseRange.min !== undefined || filters.glucoseRange.max !== undefined) count++;
    if (filters.glucoseCategory && filters.glucoseCategory.length > 0) count++;
    if (filters.hasFood !== undefined) count++;
    if (filters.hasExercise !== undefined) count++;
    if (filters.hasMedication !== undefined) count++;
    if (filters.hasNotes !== undefined) count++;
    if (filters.hasNutrition !== undefined) count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    setFilters,
    filteredLogs,
    activeFiltersCount,
    clearAllFilters,
    filterPresets
  };
};
