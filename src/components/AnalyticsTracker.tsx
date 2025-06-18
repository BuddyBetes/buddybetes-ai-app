
import React from 'react';
import { usePageTracking } from '@/hooks/usePageTracking';
import { useSessionTracking } from '@/hooks/useSessionTracking';

const AnalyticsTracker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  usePageTracking();
  useSessionTracking();

  return <>{children}</>;
};

export default AnalyticsTracker;
