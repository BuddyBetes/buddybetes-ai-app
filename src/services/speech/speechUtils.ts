
/**
 * Utility functions for speech processing
 */

/**
 * Helper function to convert Blob to base64
 * @param blob - Audio blob to convert
 * @returns Promise with base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!blob || blob.size === 0) {
      console.error("Empty blob provided to blobToBase64");
      reject(new Error("Empty audio data"));
      return;
    }
    
    console.log("Converting blob to base64, size:", blob.size, "type:", blob.type);
    
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    reader.onloadend = () => {
      try {
        const base64data = reader.result as string;
        if (!base64data) {
          throw new Error("Failed to convert audio to base64");
        }
        
        // Remove the data URL prefix
        const base64Audio = base64data.split(',')[1];
        if (!base64Audio) {
          throw new Error("Invalid base64 audio format");
        }
        
        console.log("Base64 conversion successful, length:", base64Audio.length);
        resolve(base64Audio);
      } catch (error) {
        console.error("Error in base64 conversion:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(error);
    };
  });
};
