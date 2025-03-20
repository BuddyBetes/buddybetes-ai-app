
/**
 * Browser-based speech services using Web Speech API
 * Used as fallback when Supabase Edge Functions fail
 */

// Speech recognition service using browser's Web Speech API
export const browserSpeechToText = async (audioBlob?: Blob): Promise<{ text: string } | null> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if Speech Recognition is supported
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log("Speech recognition not supported in this browser");
        reject(new Error("Speech recognition not supported in this browser"));
        return;
      }

      // Create speech recognition instance
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      // Configure recognition
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      // If we already have audio blob, we can't use it directly with the Web Speech API
      // We'll just start recognition from the mic as fallback
      if (audioBlob) {
        console.log("Browser Speech API cannot process pre-recorded audio. Starting live recognition instead.");
      }
      
      // Handle results
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Browser speech recognition result:", transcript);
        resolve({ text: transcript });
      };
      
      recognition.onerror = (event) => {
        console.error("Browser speech recognition error:", event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      recognition.onend = () => {
        // If no result event was triggered before end
        if (!recognition.result) {
          console.log("No speech detected");
          resolve({ text: "" });
        }
      };
      
      // Start recognition
      recognition.start();
      
      // Safety timeout
      setTimeout(() => {
        if (recognition) {
          console.log("Speech recognition timeout");
          recognition.stop();
          resolve({ text: "" });
        }
      }, 10000);
      
    } catch (error) {
      console.error("Error initializing browser speech recognition:", error);
      reject(error);
    }
  });
};

// Text-to-speech using browser's SpeechSynthesis API
export const browserTextToSpeech = async (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Check if Speech Synthesis is supported
      if (!('speechSynthesis' in window)) {
        console.log("Speech synthesis not supported in this browser");
        resolve(false);
        return;
      }
      
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to use a more natural voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Look for a good female voice as default
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Female') || 
          voice.name.includes('Samantha') || 
          voice.name.includes('Google') ||
          voice.lang === 'en-US'
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
      
      // Handle events
      utterance.onend = () => {
        console.log("Browser speech synthesis completed");
        resolve(true);
      };
      
      utterance.onerror = (event) => {
        console.error("Browser speech synthesis error:", event.error);
        resolve(false);
      };
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error in browser text-to-speech:", error);
      resolve(false);
    }
  });
};
