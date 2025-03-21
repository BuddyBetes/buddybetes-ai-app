
import React, { useState } from 'react';
import { format, parse } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingHealthDataProps {
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

const OnboardingHealthData: React.FC<OnboardingHealthDataProps> = ({ healthData, setHealthData }) => {
  // Calculate max date (18 years ago) and min date (100 years ago)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 1); // Allow children (minimum 1 year old)
  
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);

  const [dateInputValue, setDateInputValue] = useState(
    healthData.birthdate ? format(healthData.birthdate, 'yyyy-MM-dd') : ''
  );

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInputValue(value);
    
    try {
      // Try to parse the date
      if (value) {
        const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
        // Check if the date is valid and within range
        if (!isNaN(parsedDate.getTime()) && parsedDate <= maxDate && parsedDate >= minDate) {
          setHealthData({...healthData, birthdate: parsedDate});
        }
      } else {
        // If input is cleared, clear the date
        setHealthData({...healthData, birthdate: undefined});
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Health Information</h3>
      
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block text-gray-700 font-medium">Gender</Label>
          <RadioGroup 
            value={healthData.gender} 
            onValueChange={(value) => setHealthData({...healthData, gender: value})}
            className="flex flex-col space-y-2 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-normal">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-normal">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal">Other</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="mb-2 block text-gray-700 font-medium">Date of Birth</Label>
          <div className="space-y-2">
            <Input
              type="date"
              value={dateInputValue}
              onChange={handleDateInputChange}
              max={format(maxDate, 'yyyy-MM-dd')}
              min={format(minDate, 'yyyy-MM-dd')}
              className="w-full h-12 rounded-xl"
            />
            <p className="text-xs text-gray-500">Or select from calendar:</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal rounded-xl",
                    !healthData.birthdate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {healthData.birthdate ? (
                    format(healthData.birthdate, "PPP")
                  ) : (
                    <span>Select your date of birth</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={healthData.birthdate}
                  onSelect={(date) => {
                    setHealthData({...healthData, birthdate: date || undefined});
                    if (date) {
                      setDateInputValue(format(date, 'yyyy-MM-dd'));
                    }
                  }}
                  disabled={(date) => date > maxDate || date < minDate}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={maxDate.getFullYear() - 100}
                  toYear={maxDate.getFullYear()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height" className="mb-2 block text-gray-700 font-medium">Height</Label>
            <div className="flex space-x-2">
              <Input 
                id="height" 
                type="number" 
                value={healthData.height} 
                onChange={(e) => setHealthData({...healthData, height: e.target.value})}
                className="flex-1 h-12 rounded-xl"
                placeholder="Enter height"
              />
              <Select 
                value={healthData.heightUnit} 
                onValueChange={(value) => setHealthData({...healthData, heightUnit: value})}
              >
                <SelectTrigger className="w-24 h-12 rounded-xl">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="ft">ft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="weight" className="mb-2 block text-gray-700 font-medium">Weight</Label>
            <div className="flex space-x-2">
              <Input 
                id="weight" 
                type="number" 
                value={healthData.weight} 
                onChange={(e) => setHealthData({...healthData, weight: e.target.value})}
                className="flex-1 h-12 rounded-xl"
                placeholder="Enter weight"
              />
              <Select 
                value={healthData.weightUnit} 
                onValueChange={(value) => setHealthData({...healthData, weightUnit: value})}
              >
                <SelectTrigger className="w-24 h-12 rounded-xl">
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
          <Label htmlFor="diabetesType" className="mb-2 block text-gray-700 font-medium">Diabetes Type</Label>
          <Select 
            value={healthData.diabetesType} 
            onValueChange={(value) => setHealthData({...healthData, diabetesType: value})}
          >
            <SelectTrigger className="w-full h-12 rounded-xl" id="diabetesType">
              <SelectValue placeholder="Select your diabetes type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="type1">Type 1</SelectItem>
              <SelectItem value="type2">Type 2</SelectItem>
              <SelectItem value="gestational">Gestational</SelectItem>
              <SelectItem value="prediabetes">Prediabetes</SelectItem>
              <SelectItem value="lada">LADA</SelectItem>
              <SelectItem value="mody">MODY</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default OnboardingHealthData;
