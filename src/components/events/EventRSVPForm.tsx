import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, User, CheckCircle } from 'lucide-react';

interface EventRSVPFormProps {
  eventId: string;
}

const EventRSVPForm = ({ eventId }: EventRSVPFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('event-registration', {
        body: {
          eventId,
          ...formData,
        },
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Registration submitted! Check your email to verify your account.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-green-900">Registration Submitted!</h3>
          <p className="text-green-700 mb-4">
            We've sent a verification email to <strong>{formData.email}</strong>
          </p>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-700">
              <strong>Next Steps:</strong>
            </p>
            <ol className="text-sm text-gray-600 text-left mt-2 space-y-2">
              <li>1. Check your email inbox</li>
              <li>2. Click the verification link to create your BuddyBetes account</li>
              <li>3. You'll receive your event QR code for the raffle entry</li>
              <li>4. Set up your password to access the full BuddyBetes platform</li>
            </ol>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6">Register for Event</h2>
      <p className="text-muted-foreground mb-6">
        New to BuddyBetes? Register below and we'll create your account automatically!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <Label htmlFor="firstName" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="John"
          />
        </div>

        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Registering...' : 'Register & Create Account'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By registering, you'll automatically get a BuddyBetes account to track your glucose levels
        </p>
      </form>
    </Card>
  );
};

export default EventRSVPForm;
