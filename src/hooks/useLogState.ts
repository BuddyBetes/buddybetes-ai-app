
import { useState } from 'react';
import { GlucoseLog } from '@/types/logs';

/**
 * Hook for managing log state
 */
export const useLogState = () => {
  const [logs, setLogs] = useState<GlucoseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  return {
    logs,
    setLogs,
    isLoading,
    setIsLoading
  };
};
