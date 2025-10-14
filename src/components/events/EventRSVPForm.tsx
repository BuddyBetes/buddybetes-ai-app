import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, User } from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';

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
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkExistingRegistration = async (email: string) => {
    if (!email) return;
    
    setChecking(true);
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('qr_code')
        .eq('event_id', eventId)
        .eq('email', email)
        .maybeSingle();

      if (data) {
        setAlreadyRegistered(true);
        setQrCode(data.qr_code);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('event-registration', {
        body: {
          eventId,
          ...formData,
        },
      });

      if (error) throw error;

      setSuccess(true);
      setQrCode(data.qrCode);
      setIsNewUser(data.isNewUser);
      
      if (data.isNewUser) {
        toast.success('Account created! Check your email to set your password.');
      } else {
        toast.success('Registration successful!');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  if (alreadyRegistered && qrCode) {
    return (
      <Card className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">You're Already Registered! 🎉</h2>
          <p className="text-muted-foreground">
            You've already registered for this event. Check your email for your registration confirmation, or view your QR code below.
          </p>
        </div>
        <QRCodeDisplay 
          qrCode={qrCode}
          eventTitle="BuddyBetes Event"
          userName={formData.email || 'Attendee'}
        />
      </Card>
    );
  }

  if (success && qrCode) {
    return (
      <div className="space-y-6">
        <QRCodeDisplay 
          qrCode={qrCode}
          eventTitle="BuddyBetes Event"
          userName={`${formData.firstName} ${formData.lastName}`}
        />
        
        {isNewUser && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="space-y-3">
              <h4 className="font-bold text-blue-900">🎉 Account Created!</h4>
              <p className="text-sm text-blue-800">
                A BuddyBetes account has been created for <strong>{formData.email}</strong>
              </p>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Next Steps:</strong>
                </p>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>✅ Check your email for a password setup link</li>
                  <li>✅ Set your password to access your account</li>
                  <li>✅ Start tracking your glucose levels!</li>
                </ol>
              </div>
            </div>
          </Card>
        )}
      </div>
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
            onBlur={(e) => checkExistingRegistration(e.target.value)}
            placeholder="your@email.com"
            disabled={checking}
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
