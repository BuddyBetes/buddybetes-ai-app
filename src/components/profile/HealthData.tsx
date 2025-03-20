
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const HealthData = () => {
  const { toast } = useToast();
  const [healthData, setHealthData] = useState({
    gender: 'Female',
    age: '42',
    height: '5\'7"',
    weight: '152',
    diabetesType: 'Type 2'
  });
  
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

  const handleHealthDataChange = (field: string, value: string) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  const saveHealthData = () => {
    toast({
      title: "Success",
      description: "Your health data has been updated",
    });
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
            <SheetHeader>
              <SheetTitle>Edit Health Data</SheetTitle>
              <SheetDescription>
                Make changes to your health profile here.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="gender" className="text-right">
                  Gender
                </label>
                <Select 
                  value={healthData.gender} 
                  onValueChange={(value) => handleHealthDataChange('gender', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="age" className="text-right">
                  Age
                </label>
                <Input
                  id="age"
                  value={healthData.age}
                  onChange={(e) => handleHealthDataChange('age', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="height" className="text-right">
                  Height
                </label>
                <Input
                  id="height"
                  value={healthData.height}
                  onChange={(e) => handleHealthDataChange('height', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="weight" className="text-right">
                  Weight (lbs)
                </label>
                <Input
                  id="weight"
                  value={healthData.weight}
                  onChange={(e) => handleHealthDataChange('weight', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="diabetesType" className="text-right">
                  Diabetes Type
                </label>
                <Select 
                  value={healthData.diabetesType} 
                  onValueChange={(value) => handleHealthDataChange('diabetesType', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select diabetes type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Type 1">Type 1</SelectItem>
                    <SelectItem value="Type 2">Type 2</SelectItem>
                    <SelectItem value="Gestational">Gestational</SelectItem>
                    <SelectItem value="Pre-diabetes">Pre-diabetes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <SheetClose asChild>
                <Button onClick={saveHealthData}>Save changes</Button>
              </SheetClose>
            </div>
          </SheetContent>
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

export default HealthData;
