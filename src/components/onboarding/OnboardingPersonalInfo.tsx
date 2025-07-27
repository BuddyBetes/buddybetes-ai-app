
import React from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { User } from 'lucide-react';

interface PersonalInfo {
  firstName: string;
  lastName: string;
}

interface OnboardingPersonalInfoProps {
  personalInfo: PersonalInfo;
  setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  marketingOptIn: boolean;
  setMarketingOptIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const OnboardingPersonalInfo: React.FC<OnboardingPersonalInfoProps> = ({
  personalInfo,
  setPersonalInfo,
  marketingOptIn,
  setMarketingOptIn,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
    },
  });

  // Update parent state when form values change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setPersonalInfo({
        firstName: value.firstName || '',
        lastName: value.lastName || '',
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form, setPersonalInfo]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-buddy-100 flex items-center justify-center">
          <User className="h-5 w-5 text-buddy-500" />
        </div>
        <h2 className="text-xl font-semibold">Personal Information</h2>
      </div>
      
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-gray-700 font-medium">First Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your first name" 
                    {...field} 
                    className="h-12 rounded-xl border-gray-200 focus:border-buddy-500 focus:ring-buddy-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Last Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your last name" 
                    {...field} 
                    className="h-12 rounded-xl border-gray-200 focus:border-buddy-500 focus:ring-buddy-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />
          
          <div className="flex items-start space-x-3 mt-6 p-4 bg-gray-50 rounded-lg">
            <Checkbox 
              id="marketing-opt-in"
              checked={marketingOptIn}
              onCheckedChange={(checked) => setMarketingOptIn(checked as boolean)}
              className="mt-0.5"
            />
            <div className="flex flex-col space-y-1">
              <label 
                htmlFor="marketing-opt-in" 
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Subscribe to Buddybetes newsletter
              </label>
              <p className="text-xs text-gray-500">
                Get updates about new features, diabetes tips, and community stories. You can unsubscribe anytime.
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OnboardingPersonalInfo;
