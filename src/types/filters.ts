
export interface LogFilters {
  dateRange: {
    from?: Date;
    to?: Date;
  };
  quickDate?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth';
  mealContext?: ('before' | 'after' | 'fasting')[];
  measurementMethod?: ('finger_prick' | 'cgm')[];
  glucoseRange: {
    min?: number;
    max?: number;
  };
  glucoseCategory?: ('low' | 'normal' | 'high')[];
  hasFood?: boolean;
  hasExercise?: boolean;
  hasMedication?: boolean;
  hasNotes?: boolean;
  hasNutrition?: boolean;
}

export interface FilterPreset {
  label: string;
  value: string;
  getDateRange: () => { from: Date; to: Date };
}
