
import React, { useState } from 'react';
import { SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
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
        <SheetTitle>Edit Health Data</SheetTitle>
        <SheetDescription>
          Make changes to your health profile here.
        </SheetDescription>
      </SheetHeader>
      <div className="space-y-5 py-4">
        <div>
          <Label htmlFor="gender" className="block mb-2">
            Gender
          </Label>
          <RadioGroup 
            value={localHealthData.gender} 
            onValueChange={(value) => handleHealthDataChange('gender', value)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Female" id="female-edit" />
              <Label htmlFor="female-edit" className="font-normal">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Male" id="male-edit" />
              <Label htmlFor="male-edit" className="font-normal">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Other" id="other-edit" />
              <Label htmlFor="other-edit" className="font-normal">Other</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <Label htmlFor="birthdate" className="block mb-2">
            Date of Birth
          </Label>
          <div className="space-y-2">
            <Input
              id="birthdate"
              type="date"
              value={dateInputValue}
              onChange={handleDateInputChange}
              className="w-full"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !localHealthData.birthdate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localHealthData.birthdate ? (
                    format(localHealthData.birthdate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localHealthData.birthdate}
                  onSelect={(date) => {
                    handleHealthDataChange('birthdate', date as Date);
                    if (date) {
                      setDateInputValue(format(date, 'yyyy-MM-dd'));
                    }
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height" className="block mb-2">
              Height
            </Label>
            <div className="flex gap-2">
              <Input
                id="height"
                value={localHealthData.height}
                onChange={(e) => handleHealthDataChange('height', e.target.value)}
                className="flex-1"
              />
              <Select 
                value={localHealthData.heightUnit} 
                onValueChange={(value) => handleHealthDataChange('heightUnit', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="in">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="weight" className="block mb-2">
              Weight
            </Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                value={localHealthData.weight}
                onChange={(e) => handleHealthDataChange('weight', e.target.value)}
                className="flex-1"
              />
              <Select 
                value={localHealthData.weightUnit} 
                onValueChange={(value) => handleHealthDataChange('weightUnit', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="diabetesType" className="block mb-2">
            Diabetes Type
          </Label>
          <Select 
            value={localHealthData.diabetesType} 
            onValueChange={(value) => handleHealthDataChange('diabetesType', value)}
          >
            <SelectTrigger className="w-full">
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
