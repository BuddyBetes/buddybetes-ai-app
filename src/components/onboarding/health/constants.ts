
import { GlucoseUnit } from '@/types/global';

export const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

export const diabetesTypeOptions = [
  { value: 'type1', label: 'Type 1' },
  { value: 'type2', label: 'Type 2' },
  { value: 'gestational', label: 'Gestational' },
  { value: 'prediabetes', label: 'Prediabetes' },
  { value: 'other', label: 'Other' }
];

export const heightUnitOptions = [
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'ft', label: 'Feet (ft)' }
];

export const weightUnitOptions = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lbs', label: 'Pounds (lbs)' }
];

export const glucoseUnitOptions = [
  { value: 'mg/dL', label: 'mg/dL' },
  { value: 'mmol/L', label: 'mmol/L' }
];
