
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mic } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms and Conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const SignUp = () => {
  const { signUp, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error, user } = await signUp(values.email, values.password);
      
      if (!error && user) {
        toast({
          title: "Account created successfully",
          description: "Please check your email to confirm your account before signing in.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect authenticated users
  if (isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto w-full max-w-md space-y-6"
      >
        <div className="flex flex-col items-center space-y-2 text-center">
          <motion.div 
            className="w-20 h-20 rounded-full bg-buddy-500 flex items-center justify-center mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mic size={32} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold">Join BuddyBetes</h1>
          <p className="text-muted-foreground">
            Create an account to get started
          </p>
        </div>

        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium leading-none">
                        I have read and accept the{" "}
                        <Popover>
                          <PopoverTrigger asChild>
                            <span className="text-buddy-500 hover:underline cursor-pointer">
                              Terms and Conditions
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="start">
                            <ScrollArea className="h-80 p-4 rounded-md">
                              <div className="space-y-4">
                                <h4 className="font-medium">Terms and Conditions for BuddyBetes</h4>
                                <p>Last Updated: {new Date().toLocaleDateString()}</p>
                                
                                <h5 className="font-medium">1. Introduction</h5>
                                <p>Welcome to BuddyBetes. These Terms and Conditions govern your use of our application and services. By using BuddyBetes, you agree to these terms in full. If you disagree with these terms, you must not use our application.</p>
                                
                                <h5 className="font-medium">2. Definitions</h5>
                                <p>"BuddyBetes" refers to our application, website, and services.<br />
                                "User", "You", and "Your" refers to you, the person accessing BuddyBetes.<br />
                                "We", "Us", and "Our" refers to the owners of BuddyBetes.<br />
                                "Party", "Parties", or "Us" refers to both you and ourselves.</p>
                                
                                <h5 className="font-medium">3. Health Disclaimer</h5>
                                <p>BuddyBetes is designed to help track and manage diabetes, but it is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
                                
                                <h5 className="font-medium">4. User Accounts</h5>
                                <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
                                
                                <h5 className="font-medium">5. User Content</h5>
                                <p>You retain all rights to the health data and other content you submit to BuddyBetes. By submitting content, you grant us a worldwide, royalty-free license to use, reproduce, modify, and distribute your content solely for the purpose of providing our services.</p>
                                
                                <h5 className="font-medium">6. Privacy Policy</h5>
                                <p>Our Privacy Policy explains how we collect, use, and protect your personal information. By using BuddyBetes, you consent to the data practices described in our Privacy Policy.</p>
                                
                                <h5 className="font-medium">7. Intellectual Property</h5>
                                <p>BuddyBetes and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
                                
                                <h5 className="font-medium">8. Termination</h5>
                                <p>We may terminate or suspend your account and access to BuddyBetes immediately, without prior notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users, us, or third parties, or for any other reason at our discretion.</p>
                                
                                <h5 className="font-medium">9. Limitation of Liability</h5>
                                <p>In no event shall BuddyBetes, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
                                
                                <h5 className="font-medium">10. Changes to Terms</h5>
                                <p>We reserve the right to modify these terms at any time. When we do, we will revise the updated date at the bottom of this page. We encourage you to frequently check this page for any changes.</p>
                                
                                <h5 className="font-medium">11. Contact Information</h5>
                                <p>If you have any questions about these Terms and Conditions, please contact us at support@buddybetes.com.</p>
                                
                                <h5 className="font-medium">12. Data Storage and Security</h5>
                                <p>We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential.</p>
                                
                                <h5 className="font-medium">13. Third-Party Links</h5>
                                <p>BuddyBetes may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.</p>
                                
                                <h5 className="font-medium">14. Age Restrictions</h5>
                                <p>BuddyBetes is not intended for individuals under the age of 13. If we learn that we have collected personal information from an individual under age 13, we will delete that information as quickly as possible.</p>
                                
                                <h5 className="font-medium">15. Governing Law</h5>
                                <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.</p>
                                
                                <h5 className="font-medium">16. Dispute Resolution</h5>
                                <p>Any dispute arising from or relating to the subject matter of this Agreement shall be finally settled by arbitration, using the English language, administered by the American Arbitration Association under its Commercial Arbitration Rules then in effect.</p>
                                
                                <h5 className="font-medium">17. Severability</h5>
                                <p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>
                                
                                <h5 className="font-medium">18. Waiver</h5>
                                <p>No waiver of any term of this Agreement shall be deemed a further or continuing waiver of such term or any other term.</p>
                                
                                <p>By clicking "I accept", you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-buddy-500 hover:bg-buddy-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <p>
              Already have an account?{" "}
              <Link to="/signin" className="text-buddy-500 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
