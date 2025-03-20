
/**
 * Utility functions to parse glucose-related information from voice input
 */

import { GlucoseLog } from '@/context/LogContext';

// Types of information that can be extracted from voice input
type ExtractedLogInfo = Partial<Omit<GlucoseLog, 'id' | 'timestamp'>>;

/**
 * Extracts glucose reading information from voice input
 */
export const extractGlucoseInfo = (text: string): ExtractedLogInfo | null => {
  // Skip processing if the text is too short
  if (!text || text.length < 5) return null;
  
  const result: ExtractedLogInfo = {};
  
  // Try to extract glucose level with various patterns
  const glucosePatterns = [
    /(\d{2,3})\s*(mg\/dl|mg|points|point|level)/i,
    /glucose(?:\s+is|\s+was|\s+of|\s+reading|\s+level)?\s+(\d{2,3})/i,
    /blood\s+sugar(?:\s+is|\s+was|\s+of|\s+reading|\s+level)?\s+(\d{2,3})/i,
    /reading(?:\s+is|\s+was|\s+of)?\s+(\d{2,3})/i,
    /level(?:\s+is|\s+was|\s+of)?\s+(\d{2,3})/i,
    /(\d{2,3})(?:\s+mg\/dl|\s+mg|\s+points|\s+point|\s+level)/i,
    /my\s+(?:glucose|sugar|reading)\s+(?:is|was)\s+(\d{2,3})/i
  ];
  
  for (const pattern of glucosePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const level = parseInt(match[1], 10);
      if (!isNaN(level) && level > 30 && level < 600) { // Reasonable glucose range
        result.glucoseLevel = level;
        break;
      }
    }
  }
  
  // Extract food information
  const foodMatches = [
    /(?:ate|had|consumed|eating|eat|having)\s+(.*?)(?:before|after|for|and|with|when|\.|\,|\!|\?|$)/i,
    /(?:my meal was|food was|food is|meal is)\s+(.*?)(?:\.|\,|\!|\?|$)/i,
    /(?:after eating|food|ate)\s+(.*?)(?:\.|\,|\!|\?|and my|my glucose|my reading|my level|$)/i
  ];
  
  for (const pattern of foodMatches) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      result.food = match[1].trim();
      break;
    }
  }
  
  // Extract meal context
  if (/before meal|before eating|pre-meal|premeal|before lunch|before dinner|before breakfast/i.test(text)) {
    result.mealContext = 'before';
  } else if (/after meal|after eating|post-meal|postmeal|after lunch|after dinner|after breakfast/i.test(text)) {
    result.mealContext = 'after';
  } else if (/fasting|waking up|morning|empty stomach|haven't eaten|didn't eat/i.test(text)) {
    result.mealContext = 'fasting';
  }
  
  // Extract notes
  const notesMatch = text.match(/note(?:s)?\s*(?:is|are|:)?\s*(.*?)(?:\.|\,|\!|\?|$)/i);
  if (notesMatch && notesMatch[1]) {
    result.notes = notesMatch[1].trim();
  }
  
  // Only return the result if we have at least a glucose level
  return result.glucoseLevel ? result : null;
}

/**
 * Determines if the voice input is likely meant to log glucose information
 */
export const isGlucoseLogIntent = (text: string): boolean => {
  const logPatterns = [
    /my glucose/i,
    /my sugar/i,
    /my blood sugar/i,
    /my reading/i,
    /glucose level/i,
    /my level/i,
    /(\d{2,3})\s*(mg\/dl|mg)/i,
    /log my/i,
    /add (a|new) (reading|log|entry)/i,
    /glucose(?:\s+is|\s+was|\s+of)?\s+(\d{2,3})/i,
    /blood\s+sugar(?:\s+is|\s+was|\s+of)?\s+(\d{2,3})/i,
    /reading(?:\s+is|\s+was|\s+of)?\s+(\d{2,3})/i
  ];
  
  return logPatterns.some(pattern => pattern.test(text));
}
