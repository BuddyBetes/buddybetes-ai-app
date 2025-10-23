interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

export async function sendEmailWithRetry(
  sendFunction: () => Promise<any>,
  config: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000
  }
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      const result = await sendFunction();
      
      // Check for Resend-specific errors
      if (result.error) {
        const errorMsg = result.error.message || '';
        
        // Don't retry if it's a validation error
        if (errorMsg.includes('validation') || errorMsg.includes('invalid email')) {
          throw new Error(errorMsg);
        }
        
        // Retry on rate limit or network errors
        if (errorMsg.includes('rate limit') || errorMsg.includes('timeout')) {
          throw new Error(errorMsg);
        }
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on last attempt
      if (attempt === config.maxRetries - 1) break;
      
      // Calculate exponential backoff delay
      const delay = Math.min(
        config.initialDelayMs * Math.pow(2, attempt),
        config.maxDelayMs
      );
      
      console.log(`[RETRY] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}
