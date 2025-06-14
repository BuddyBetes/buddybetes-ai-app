
export interface GlucoseLog {
  timestamp: string;
  glucoseLevel: number;
  food?: string;
  mealContext?: string;
  notes?: string;
}

export interface GlucoseStats {
  count: number;
  average: number;
  min: number;
  max: number;
  inRange: number;
  inRangePercent: number;
}

export interface InsightRequest {
  glucoseHistory: GlucoseLog[];
  language?: 'english' | 'tagalog';
  timeRange?: string;
}

export interface InsightResponse {
  insights: string[];
  stats: {
    average: number;
    min: number;
    max: number;
    inRangePercent: number;
    totalReadings: number;
    mealsLogged: number;
    exerciseEntries: number;
  };
  analysis: {
    mealImpact: string;
    exerciseImpact: string;
    timePatterns: string;
  };
}
