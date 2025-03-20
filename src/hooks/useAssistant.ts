
// This file now re-exports from the new structured files
// for backwards compatibility
import { useAssistant as useAssistantHook, TIME_GROUPS } from './assistant/useAssistant';

export const useAssistant = useAssistantHook;
export { TIME_GROUPS };
