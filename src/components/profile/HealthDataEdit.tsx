
import React, { useState } from 'react';
import { SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format, parse } from 'date-fns';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface HealthDataEditProps {
  healthData: {
    gender: string;
    birthdate: Date | undefined;
    height: string;
    heightUnit: string;
    weight: string;
    weightUnit: string;
    diabetesType: string;
  };
  setHealthData: React.Dispatch<React.SetStateAction<{
    gender: string;
    birthdate: Date | undefined;
    height: string;
    heightUnit: string;
    weight: string;
    weightUnit: string;
    diabetesType: string;
  }>>;
}

const HealthDataEdit = ({ healthData, setHealthData }: HealthDataEditProps) => {
  const { toast } = useToast();
  const [localHealthData, setLocalHealthData] = useState(healthData);
  const [isSaving, setIsSaving] = useState(false);
  const [dateInputValue, setDateInputValue] = useState(
    localHealthData.birthdate ? format(localHealthData.birthdate, 'yyyy-MM-dd') : ''
  );

  const handleHealthDataChange = (field: string, value: string | Date) => {
    setLocalHealthData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInputValue(value);
    
    try {
      // Try to parse the date
      if (value) {
        const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
        // Check if the date is valid
        if (!isNaN(parsedDate.getTime())) {
          handleHealthDataChange('birthdate', parsedDate);
        }
      } else {
        // If input is cleared, clear the date
        handleHealthDataChange('birthdate', undefined as unknown as Date);
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
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
        <SheetTitle className="text-base">Edit Health Data</SheetTitle>
        <SheetDescription className="text-xs">
          Make changes to your health profile here.
        </SheetDescription>
      </SheetHeader>
      <div className="space-y-4 py-3">
        <div>
          <Label htmlFor="gender" className="block mb-1.5 text-sm">
            Gender
          </Label>
          <RadioGroup 
            value={localHealthData.gender} 
            onValueChange={(value) => handleHealthDataChange('gender', value)}
            className="flex flex-col space-y-1.5"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Female" id="female-edit" />
              <Label htmlFor="female-edit" className="font-normal text-sm">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Male" id="male-edit" />
              <Label htmlFor="male-edit" className="font-normal text-sm">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Other" id="other-edit" />
              <Label htmlFor="other-edit" className="font-normal text-sm">Other</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <Label htmlFor="birthdate" className="block mb-1.5 text-sm">
            Date of Birth
          </Label>
          <Input
            id="birthdate"
            type="date"
            value={dateInputValue}
            onChange={handleDateInputChange}
            className="w-full text-sm"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="height" className="block mb-1.5 text-sm">
              Height
            </Label>
            <div className="flex gap-2">
              <Input
                id="height"
                value={localHealthData.height}
                onChange={(e) => handleHealthDataChange('height', e.target.value)}
                className="flex-1 text-sm"
              />
              <Select 
                value={localHealthData.heightUnit} 
                onValueChange={(value) => handleHealthDataChange('heightUnit', value)}
              >
                <SelectTrigger className="w-20 text-sm">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm" className="text-sm">cm</SelectItem>
                  <SelectItem value="in" className="text-sm">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="weight" className="block mb-1.5 text-sm">
              Weight
            </Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                value={localHealthData.weight}
                onChange={(e) => handleHealthDataChange('weight', e.target.value)}
                className="flex-1 text-sm"
              />
              <Select 
                value={localHealthData.weightUnit} 
                onValueChange={(value) => handleHealthDataChange('weightUnit', value)}
              >
                <SelectTrigger className="w-20 text-sm">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg" className="text-sm">kg</SelectItem>
                  <SelectItem value="lbs" className="text-sm">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="diabetesType" className="block mb-1.5 text-sm">
            Diabetes Type
          </Label>
          <Select 
            value={localHealthData.diabetesType} 
            onValueChange={(value) => handleHealthDataChange('diabetesType', value)}
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="Select diabetes type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Type 1" className="text-sm">Type 1</SelectItem>
              <SelectItem value="Type 2" className="text-sm">Type 2</SelectItem>
              <SelectItem value="Gestational" className="text-sm">Gestational</SelectItem>
              <SelectItem value="Pre-diabetes" className="text-sm">Pre-diabetes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end mt-3">
        <SheetClose asChild>
          <Button 
            onClick={saveHealthData} 
            disabled={isSaving}
            size="sm"
            className="text-sm"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </SheetClose>
      </div>
    </SheetContent>
  );
};

export default HealthDataEdit;
