
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
import { ActivitySquare, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface HealthData {
  gender: string;
  birthdate: Date | undefined;
  height: string;
  heightUnit: string;
  weight: string;
  weightUnit: string;
  diabetesType: string;
}

interface OnboardingHealthDataProps {
  healthData: HealthData;
  setHealthData: React.Dispatch<React.SetStateAction<HealthData>>;
}

const formSchema = z.object({
  gender: z.string().min(1, 'Please select your gender'),
  birthdate: z.date({
    required_error: 'Please select your date of birth',
  }),
  height: z.string().min(1, 'Height is required'),
  heightUnit: z.string().min(1, 'Please select height unit'),
  weight: z.string().min(1, 'Weight is required'),
  weightUnit: z.string().min(1, 'Please select weight unit'),
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
      birthdate: healthData.birthdate,
      height: healthData.height,
      heightUnit: healthData.heightUnit || 'cm',
      weight: healthData.weight,
      weightUnit: healthData.weightUnit || 'lbs',
      diabetesType: healthData.diabetesType,
    },
  });

  // Update parent state when form values change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setHealthData({
        gender: value.gender || '',
        birthdate: value.birthdate,
        height: value.height || '',
        heightUnit: value.heightUnit || 'cm',
        weight: value.weight || '',
        weightUnit: value.weightUnit || 'lbs',
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
            name="birthdate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-gray-700 font-medium">Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-12 rounded-xl w-full border-gray-200 focus:border-buddy-500 focus:ring-buddy-500 pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Height</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter height" 
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
              name="heightUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-buddy-500 focus:ring-buddy-500">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="in">in</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Weight</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter weight" 
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
              name="weightUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-buddy-500 focus:ring-buddy-500">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
          
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
