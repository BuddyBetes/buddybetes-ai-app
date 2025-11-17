
import React from 'react';
import { motion } from 'framer-motion';
import { GlucoseUnit } from '@/types/global';
import SelectField from './health/SelectField';
import MeasurementField from './health/MeasurementField';
import DateField from './health/DateField';
import { 
  genderOptions, 
  diabetesTypeOptions, 
  heightUnitOptions, 
  weightUnitOptions, 
  glucoseUnitOptions 
} from './health/constants';

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHealthData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4">Tell us about your health</h2>
      <p className="text-sm text-muted-foreground mb-4">* Required fields</p>
      
      <div className="space-y-4">
        <SelectField
          id="gender"
          label="Gender *"
          options={genderOptions}
          value={healthData.gender}
          onValueChange={(value) => setHealthData(prev => ({ ...prev, gender: value }))}
        />

        <DateField
          value={healthData.birthdate}
          onChange={(date) => setHealthData(prev => ({ ...prev, birthdate: date }))}
        />

        <MeasurementField
          id="height"
          label="Height *"
          value={healthData.height}
          onChange={handleInputChange}
          unit={healthData.heightUnit}
          unitOptions={heightUnitOptions}
          onUnitChange={(value) => setHealthData(prev => ({ ...prev, heightUnit: value }))}
        />
        
        <MeasurementField
          id="weight"
          label="Weight *"
          value={healthData.weight}
          onChange={handleInputChange}
          unit={healthData.weightUnit}
          unitOptions={weightUnitOptions}
          onUnitChange={(value) => setHealthData(prev => ({ ...prev, weightUnit: value }))}
        />

        <SelectField
          id="diabetesType"
          label="Diabetes Type *"
          options={diabetesTypeOptions}
          value={healthData.diabetesType}
          onValueChange={(value) => setHealthData(prev => ({ ...prev, diabetesType: value }))}
        />

        <SelectField
          id="glucoseUnit"
          label="Preferred Glucose Unit"
          options={glucoseUnitOptions}
          value={healthData.glucoseUnit}
          onValueChange={(value) => setHealthData(prev => ({ ...prev, glucoseUnit: value as GlucoseUnit }))}
        />
        <p className="text-xs text-gray-500 mt-1">
          This setting can be changed later in your profile settings.
        </p>
      </div>
    </motion.div>
  );
};

export default OnboardingHealthData;
