
import { GlucoseUnit } from '@/types/global';

// Conversion rates
// 1 mmol/L = 18 mg/dL
const MMOL_TO_MGDL_FACTOR = 18;

/**
 * Convert glucose value between mg/dL and mmol/L
 */
export const convertGlucoseValue = (
  value: number,
  fromUnit: GlucoseUnit,
  toUnit: GlucoseUnit
): number => {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'mmol/L' && toUnit === 'mg/dL') {
    // Convert from mmol/L to mg/dL
    return Math.round(value * MMOL_TO_MGDL_FACTOR);
  } else {
    // Convert from mg/dL to mmol/L
    return parseFloat((value / MMOL_TO_MGDL_FACTOR).toFixed(1));
  }
};

/**
 * Detect if a glucose reading is likely in mmol/L based on its value
 * Typically, mmol/L readings are between 1-30, while mg/dL are between 20-600
 */
export const detectGlucoseUnit = (value: number): GlucoseUnit => {
  // If the value is less than 30, it's likely mmol/L
  if (value < 30) {
    return 'mmol/L';
  } else {
    return 'mg/dL';
  }
};

/**
 * Format glucose value with the appropriate unit
 */
export const formatGlucoseValue = (value: number | undefined, unit: GlucoseUnit): string => {
  if (value === undefined) return '';
  return `${value} ${unit}`;
};
