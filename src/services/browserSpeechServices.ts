// Keep browser recognition fallback mechanism
// This is a fallback service in case the OpenAI API is not available

/**
 * Performs browser-based speech recognition
 * @param audioFile - Optional audio file to transcribe
 * @param language - Optional language code (default: "en-US")
 * @returns Promise with transcription result
 */
export const browserSpeechToText = async (
  audioFile?: File, 
  language: string = "en"
): Promise<{ text: string } | null> => {
  console.log("Using browser-based speech recognition as fallback");
  
  // Map simple language codes to SpeechRecognition language codes
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'tl': 'fil-PH',  // Tagalog
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'pt': 'pt-BR',
    'ru': 'ru-RU',
    'zh': 'zh-CN',
  };
  
  // Get the appropriate language code for speech recognition
  const recognitionLanguage = languageMap[language] || 'en-US';
  console.log("Using recognition language:", recognitionLanguage);
  
  return new Promise((resolve, reject) => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Browser does not support speech recognition");
      reject(new Error("Browser does not support speech recognition"));
      return;
    }
    
    const recognition = new SpeechRecognition();
    
    // Configure the recognition
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = recognitionLanguage;
    recognition.maxAlternatives = 1;
    
    // Store results
    let transcript = '';
    
    // Handle speech recognition results
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const result = event.results[i][0].transcript;
          console.log("Browser speech recognition interim result:", result);
          transcript += result + ' ';
        }
      }
    };
    
    // Handle speech recognition end
    recognition.onend = () => {
      console.log("Browser speech recognition completed");
      if (transcript.trim()) {
        resolve({ text: transcript.trim() });
      } else {
        console.warn("No speech detected in browser recognition");
        reject(new Error("No speech detected"));
      }
    };
    
    // Handle errors
    recognition.onerror = (event) => {
      console.error("Browser speech recognition error:", event.error);
      reject(new Error(`Browser speech recognition error: ${event.error}`));
    };
    
    // If we have an audio file, we need to play it
    if (audioFile) {
      console.log("Playing audio file for recognition");
      const audio = new Audio(URL.createObjectURL(audioFile));
      audio.onended = () => {
        console.log("Audio playback completed, stopping recognition");
        recognition.stop();
      };
      audio.onerror = (e) => {
        console.error("Error playing audio file:", e);
        reject(new Error("Error playing audio file"));
      };
      audio.play().then(() => {
        console.log("Starting recognition during audio playback");
        recognition.start();
      }).catch(e => {
        console.error("Could not start audio playback:", e);
        reject(new Error("Could not start audio playback"));
      });
    } else {
      // If no audio file, just start recognition (uses microphone)
      console.log("Starting browser speech recognition with microphone");
      recognition.start();
      
      // Auto-stop after a few seconds of silence
      setTimeout(() => {
        recognition.stop();
      }, 5000);
    }
  });
};
