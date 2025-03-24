
export interface GlucoseLog {
  id: string;
  timestamp: Date;
  glucoseLevel: number | undefined;
  food?: string;
  mealContext?: 'before' | 'after' | 'fasting';
  medication?: string;
  weight?: number;
  notes?: string;
}

export interface LogContextType {
  logs: GlucoseLog[];
  addLog: (log: Omit<GlucoseLog, 'id'>) => Promise<void>;
  updateLog: (log: GlucoseLog) => Promise<void>; 
  deleteLog: (logId: string) => Promise<void>;
  getRecentLogs: (count: number) => GlucoseLog[];
  getGlucoseLogsOnly: (count: number) => GlucoseLog[];
  getLogsForToday: () => GlucoseLog[];
  getAverageGlucose: () => number;
  isLoading: boolean;
}
