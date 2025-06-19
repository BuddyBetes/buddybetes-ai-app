
export interface DailyActiveUser {
  date: string;
  total_active_users: number;
  new_users: number;
  returning_users: number;
  total_sessions: number;
}

export interface RetentionData {
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
  total_users: number;
  total_registered_users: number;
  total_active_users: number;
  health_data_users: number;
  ai_assistant_users: number;
  engagement_rate: number;
}

export interface EngagementData {
  hour: number;
  activity_count: number;
}

export interface FeatureUsage {
  feature: string;
  usage_count: number;
}

export interface AnalyticsResponse {
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
  total_users: number;
  total_registered_users: number;
  total_active_users: number;
  health_data_users: number;
  ai_assistant_users: number;
  engagement_rate: number;
}
