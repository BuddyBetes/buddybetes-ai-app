
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import HealthDataEdit from './HealthDataEdit';

interface HealthDataDisplayProps {
  healthData: {
    gender: string;
    age: string;
    height: string;
    weight: string;
    diabetesType: string;
  };
  setHealthData: React.Dispatch<React.SetStateAction<{
    gender: string;
    age: string;
    height: string;
    weight: string;
    diabetesType: string;
  }>>;
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
          <HealthDataEdit healthData={healthData} setHealthData={setHealthData} />
        </Sheet>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Gender</div>
          <div className="font-medium">{healthData.gender}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Age</div>
          <div className="font-medium">{healthData.age}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Height</div>
          <div className="font-medium">{healthData.height}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Weight</div>
          <div className="font-medium">{healthData.weight} lbs</div>
        </div>
        <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Diabetes Type</div>
          <div className="font-medium">{healthData.diabetesType}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthDataDisplay;
