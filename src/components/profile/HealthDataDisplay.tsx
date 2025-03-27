
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import HealthDataEdit from './HealthDataEdit';
import { format } from 'date-fns';
import { GlucoseUnit } from '@/types/global';

interface HealthDataType {
  gender: string;
  birthdate: Date | undefined;
  height: string;
  heightUnit: string;
  weight: string;
  weightUnit: string;
  diabetesType: string;
  glucoseUnit: GlucoseUnit;
}

interface HealthDataDisplayProps {
  healthData: HealthDataType;
  setHealthData: (data: HealthDataType) => void;
}

const HealthDataDisplay = ({ healthData, setHealthData }: HealthDataDisplayProps) => {
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  // Calculate age from birthdate
  const calculateAge = (birthdate: Date | undefined): string => {
    if (!birthdate) return 'Not specified';
    
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const handleUpdate = () => {
    // This function is called after the health data is updated
    console.log("Health data updated");
  };

  return (
    <motion.div 
      custom={1}
      variants={itemVariants}
      className="p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-500">Health Data</h3>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">Edit</Button>
          </SheetTrigger>
          <SheetContent>
            <HealthDataEdit 
              healthData={{
                gender: healthData.gender,
                birthdate: healthData.birthdate,
                height: healthData.height,
                height_unit: healthData.heightUnit,
                weight: healthData.weight,
                weight_unit: healthData.weightUnit,
                diabetes_type: healthData.diabetesType,
                glucose_unit: healthData.glucoseUnit,
              }} 
              onUpdate={handleUpdate} 
              onCancel={() => {}} 
            />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Gender</div>
          <div className="font-medium">{healthData.gender || 'Not specified'}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Age</div>
          <div className="font-medium">{calculateAge(healthData.birthdate)}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Date of Birth</div>
          <div className="font-medium">
            {healthData.birthdate 
              ? format(healthData.birthdate, 'PPP') 
              : 'Not specified'}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Height</div>
          <div className="font-medium">
            {healthData.height ? `${healthData.height} ${healthData.heightUnit}` : 'Not specified'}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Weight</div>
          <div className="font-medium">
            {healthData.weight ? `${healthData.weight} ${healthData.weightUnit}` : 'Not specified'}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Diabetes Type</div>
          <div className="font-medium">{healthData.diabetesType || 'Not specified'}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Glucose Unit</div>
          <div className="font-medium">{healthData.glucoseUnit || 'mg/dL'}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthDataDisplay;
