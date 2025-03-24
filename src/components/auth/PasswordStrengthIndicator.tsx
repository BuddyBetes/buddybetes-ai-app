
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, AlertCircle, Info } from 'lucide-react';

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'none';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return 'none';
    
    // Criteria
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Count criteria that are met
    const criteria = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar];
    const metCriteria = criteria.filter(Boolean).length;
    
    if (metCriteria <= 2) return 'weak';
    if (metCriteria <= 4) return 'medium';
    return 'strong';
  };
  
  const strength = getPasswordStrength(password);
  
  // Set progress value and color based on strength
  const getProgressValue = (strength: PasswordStrength): number => {
    switch (strength) {
      case 'weak': return 33;
      case 'medium': return 66;
      case 'strong': return 100;
      default: return 0;
    }
  };
  
  const getProgressColor = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };
  
  const getIcon = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'strong':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };
  
  if (strength === 'none') return null;
  
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {getIcon(strength)}
          <span className={`text-xs font-medium ${
            strength === 'weak' ? 'text-red-500' : 
            strength === 'medium' ? 'text-yellow-500' : 
            'text-green-500'
          }`}>
            {strength.charAt(0).toUpperCase() + strength.slice(1)} password
          </span>
        </div>
      </div>
      <Progress 
        value={getProgressValue(strength)} 
        className={`h-1.5 ${getProgressColor(strength)}`}
      />
    </div>
  );
};

export default PasswordStrengthIndicator;
