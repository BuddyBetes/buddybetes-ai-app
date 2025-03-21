
import React, { useState } from 'react';
import { SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

  const handleHealthDataChange = (field: string, value: string | Date) => {
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
          <label htmlFor="birthdate" className="text-right">
            Date of Birth
          </label>
          <div className="col-span-3">
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
                  onSelect={(date) => handleHealthDataChange('birthdate', date as Date)}
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
        
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="height" className="text-right">
            Height
          </label>
          <div className="col-span-3 grid grid-cols-2 gap-2">
            <Input
              id="height"
              value={localHealthData.height}
              onChange={(e) => handleHealthDataChange('height', e.target.value)}
            />
            <Select 
              value={localHealthData.heightUnit} 
              onValueChange={(value) => handleHealthDataChange('heightUnit', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="in">in</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="weight" className="text-right">
            Weight
          </label>
          <div className="col-span-3 grid grid-cols-2 gap-2">
            <Input
              id="weight"
              value={localHealthData.weight}
              onChange={(e) => handleHealthDataChange('weight', e.target.value)}
            />
            <Select 
              value={localHealthData.weightUnit} 
              onValueChange={(value) => handleHealthDataChange('weightUnit', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lbs">lbs</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
