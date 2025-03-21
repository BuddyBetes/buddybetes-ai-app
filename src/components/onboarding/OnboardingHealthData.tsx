
import React from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { ActivitySquare } from 'lucide-react';

interface HealthData {
  gender: string;
  age: string;
  height: string;
  weight: string;
  diabetesType: string;
}

interface OnboardingHealthDataProps {
  healthData: HealthData;
  setHealthData: React.Dispatch<React.SetStateAction<HealthData>>;
}

const formSchema = z.object({
  gender: z.string().min(1, 'Please select your gender'),
  age: z.string().min(1, 'Age is required'),
  height: z.string().min(1, 'Height is required'),
  weight: z.string().min(1, 'Weight is required'),
  diabetesType: z.string().min(1, 'Please select your diabetes type'),
});

const OnboardingHealthData: React.FC<OnboardingHealthDataProps> = ({
  healthData,
  setHealthData,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: healthData.gender,
      age: healthData.age,
      height: healthData.height,
      weight: healthData.weight,
      diabetesType: healthData.diabetesType,
    },
  });

  // Update parent state when form values change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setHealthData({
        gender: value.gender || '',
        age: value.age || '',
        height: value.height || '',
        weight: value.weight || '',
        diabetesType: value.diabetesType || '',
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form, setHealthData]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-buddy-100 flex items-center justify-center">
          <ActivitySquare className="h-5 w-5 text-buddy-500" />
        </div>
        <h2 className="text-xl font-semibold">Health Information</h2>
      </div>
      
      <Form {...form}>
        <form className="space-y-5">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-buddy-500 focus:ring-buddy-500">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Age</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your age" 
                    type="number" 
                    {...field} 
                    className="h-12 rounded-xl border-gray-200 focus:border-buddy-500 focus:ring-buddy-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Height (in inches or cm)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 5'7\" or 170cm" 
                    {...field} 
                    className="h-12 rounded-xl border-gray-200 focus:border-buddy-500 focus:ring-buddy-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Weight (in lbs)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 150" 
                    type="number" 
                    {...field} 
                    className="h-12 rounded-xl border-gray-200 focus:border-buddy-500 focus:ring-buddy-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="diabetesType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Diabetes Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-buddy-500 focus:ring-buddy-500">
                      <SelectValue placeholder="Select your diabetes type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="Type 1">Type 1</SelectItem>
                    <SelectItem value="Type 2">Type 2</SelectItem>
                    <SelectItem value="Gestational">Gestational</SelectItem>
                    <SelectItem value="Pre-diabetes">Pre-diabetes</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default OnboardingHealthData;
