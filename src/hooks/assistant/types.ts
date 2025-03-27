
import { Message } from '@/types';

export interface AssistantHookReturn {
  mode: 'voice' | 'text';
  messages: Message[];
  input: string;
  isLoading: boolean;
  showWelcome: boolean;
  showScrollButton: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isPlayingResponse: boolean;
  logCreated: boolean;
  askForTime: boolean;
  handleStartSession: () => void;
  handleEndSession: () => void;
  handleTextMode: () => void;
  handleVoiceMode: () => void;
  handleInputChange: (value: string) => void;
  handleSuggestionSelect: (suggestion: string) => void;
  handleDismissWelcome: () => void;
  handleSend: () => void;
  handleSpeechResult: (text: string) => void;
  scrollToBottom: () => void;
  setShowScrollButton: (show: boolean) => void;
}

export interface NavigationState {
  from?: string;
  intent?: string;
}
