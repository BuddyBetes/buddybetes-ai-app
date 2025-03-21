
import React, { useState } from 'react';
import { SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HealthDataEditProps {
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

const HealthDataEdit = ({ healthData, setHealthData }: HealthDataEditProps) => {
  const { toast } = useToast();
  const [localHealthData, setLocalHealthData] = useState({ ...healthData });
  const [isSaving, setIsSaving] = useState(false);

  const handleHealthDataChange = (field: string, value: string) => {
    setLocalHealthData(prev => ({ ...prev, [field]: value }));
  };

  const saveHealthData = async () => {
    setIsSaving(true);
    try {
      await setHealthData(localHealthData);
      
      toast({
        title: "Success",
        description: "Your health data has been updated",
      });
    } catch (error) {
      console.error('Error saving health data:', error);
      toast({
        title: "Error",
        description: "Failed to update your health data",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
            value={localHealthData.gender} 
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
            value={localHealthData.age}
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
            value={localHealthData.height}
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
            value={localHealthData.weight}
            onChange={(e) => handleHealthDataChange('weight', e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="diabetesType" className="text-right">
            Diabetes Type
          </label>
          <Select 
            value={localHealthData.diabetesType} 
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
          <Button 
            onClick={saveHealthData} 
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </SheetClose>
      </div>
    </SheetContent>
  );
};

export default HealthDataEdit;
