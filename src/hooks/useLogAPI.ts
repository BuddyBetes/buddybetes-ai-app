
import { useLogOperations } from './useLogOperations';
import { useLogUtils } from './useLogUtils';

/**
 * Main hook for log API operations
 * Acts as a facade for the more focused hooks
 */
export const useLogAPI = () => {
  const { logs, isLoading, fetchLogs, addLog, updateLog, deleteLog } = useLogOperations();
  
  return {
    logs,
    isLoading,
    fetchLogs,
    addLog,
    updateLog,
    deleteLog
  };
};
