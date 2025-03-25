
import { useAuth } from '@/context/AuthContext';
import { useFetchLogs } from './logs/useFetchLogs';
import { useLogMutations } from './logs/useLogMutations';
import { LogAPIHook } from './logs/types';

export const useLogAPI = (): LogAPIHook => {
  const { user } = useAuth();
  const { logs, setLogs, isLoading, setIsLoading, fetchLogs } = useFetchLogs(user?.id);
  const { addLog, updateLog, deleteLog } = useLogMutations(user?.id, setLogs, setIsLoading);

  return {
    logs,
    isLoading,
    fetchLogs,
    addLog,
    updateLog,
    deleteLog
  };
};
