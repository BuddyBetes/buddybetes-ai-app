
/// <reference types="vite/client" />

interface Window {
  webkitSpeechRecognition?: typeof SpeechRecognition;
  SpeechRecognition?: typeof SpeechRecognition;
}

interface SpeechSynthesisUtterance {
  voice: SpeechSynthesisVoice | null;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  onend: (this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any;
  onerror: (this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any;
}

interface SpeechSynthesisErrorEvent extends Event {
  error: string;
}
