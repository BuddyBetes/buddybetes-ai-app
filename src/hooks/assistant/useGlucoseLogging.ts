
// Re-export from the new structured files
import { useGlucoseLogging as useGlucoseLoggingHook, TIME_GROUPS } from './glucose/useGlucoseLogging';

export const useGlucoseLogging = useGlucoseLoggingHook;
export { TIME_GROUPS };
