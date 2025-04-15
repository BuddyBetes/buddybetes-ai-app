
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlucoseUnit } from '@/types/global';

interface OnboardingHealthDataProps {
  healthData: {
    gender: string;
    birthdate: Date | undefined;
    height: string;
    heightUnit: string;
    weight: string;
    weightUnit: string;
    diabetesType: string;
    glucoseUnit: GlucoseUnit;
  };
  setHealthData: React.Dispatch<React.SetStateAction<{
    gender: string;
    birthdate: Date | undefined;
    height: string;
    heightUnit: string;
    weight: string;
    weightUnit: string;
    diabetesType: string;
    glucoseUnit: GlucoseUnit;
  }>>;
}

const OnboardingHealthData: React.FC<OnboardingHealthDataProps> = ({ healthData, setHealthData }) => {
  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const diabetesTypes = [
    { value: 'type1', label: 'Type 1' },
    { value: 'type2', label: 'Type 2' },
    { value: 'gestational', label: 'Gestational' },
    { value: 'prediabetes', label: 'Prediabetes' },
    { value: 'other', label: 'Other' }
  ];

  const heightUnits = [
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'ft', label: 'Feet (ft)' }
  ];

  const weightUnits = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'lbs', label: 'Pounds (lbs)' }
  ];

  const glucoseUnits = [
    { value: 'mg/dL', label: 'mg/dL' },
    { value: 'mmol/L', label: 'mmol/L' }
  ];

  const handleHeightUnitChange = (value: string) => {
    setHealthData(prev => ({
      ...prev,
      heightUnit: value
    }));
  };

  const handleWeightUnitChange = (value: string) => {
    setHealthData(prev => ({
      ...prev,
      weightUnit: value
    }));
  };

  const handleGlucoseUnitChange = (value: string) => {
    setHealthData(prev => ({
      ...prev,
      glucoseUnit: value as GlucoseUnit
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHealthData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    
    if (dateValue) {
      // Create Date object from input string
      const newDate = new Date(dateValue);
      
      // Check if date is valid
      if (!isNaN(newDate.getTime())) {
        setHealthData(prev => ({
          ...prev,
          birthdate: newDate
        }));
      }
    } else {
      // Handle case when input is cleared
      setHealthData(prev => ({
        ...prev,
        birthdate: undefined
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4">Tell us about your health</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={healthData.gender} onValueChange={(value) => setHealthData(prev => ({ ...prev, gender: value }))}>
            <SelectTrigger id="gender" className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map(gender => (
                <SelectItem key={gender.value} value={gender.value}>{gender.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthdate">Birthdate</Label>
          <Input
            id="birthdate"
            type="date"
            value={healthData.birthdate ? format(healthData.birthdate, 'yyyy-MM-dd') : ''}
            onChange={handleDateChange}
            max={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <div className="flex space-x-2">
              <Input
                id="height"
                name="height"
                placeholder="Height"
                value={healthData.height}
                onChange={handleInputChange}
                className="flex-1"
              />
              <Select value={healthData.heightUnit} onValueChange={handleHeightUnitChange}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {heightUnits.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <div className="flex space-x-2">
              <Input
                id="weight"
                name="weight"
                placeholder="Weight"
                value={healthData.weight}
                onChange={handleInputChange}
                className="flex-1"
              />
              <Select value={healthData.weightUnit} onValueChange={handleWeightUnitChange}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {weightUnits.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diabetesType">Diabetes Type</Label>
          <Select value={healthData.diabetesType} onValueChange={(value) => setHealthData(prev => ({ ...prev, diabetesType: value }))}>
            <SelectTrigger id="diabetesType" className="w-full">
              <SelectValue placeholder="Select diabetes type" />
            </SelectTrigger>
            <SelectContent>
              {diabetesTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="glucoseUnit">Preferred Glucose Unit</Label>
          <Select value={healthData.glucoseUnit} onValueChange={handleGlucoseUnitChange}>
            <SelectTrigger id="glucoseUnit" className="w-full">
              <SelectValue placeholder="Select glucose unit" />
            </SelectTrigger>
            <SelectContent>
              {glucoseUnits.map(unit => (
                <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            This setting can be changed later in your profile settings.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default OnboardingHealthData;
