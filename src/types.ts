
export interface NutritionalInfo {
  name: string;
  calories: string;
  carbs: string;
  details: string;
}

export interface GlucoseStats {
  average: number;
  min: number;
  max: number;
  inRangePercent: number;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  magnitude: number;
  firstHalfAvg: number;
  secondHalfAvg: number;
}

export interface Message {
  text: string;
  type: 'user' | 'assistant';
  nutritionalInfo?: NutritionalInfo;
  stats?: GlucoseStats;
  trendAnalysis?: TrendAnalysis;
  timestamp: number;
  isNew?: boolean;
}
