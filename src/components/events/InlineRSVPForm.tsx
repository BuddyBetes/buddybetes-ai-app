import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, User, Loader2 } from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';

interface InlineRSVPFormProps {
  eventId: string;
  eventTitle: string;
  onSuccess?: () => void;
}

const InlineRSVPForm = ({ eventId, eventTitle, onSuccess }: InlineRSVPFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileAndCheckRegistration();
    }
  }, [user, eventId]);

  const loadProfileAndCheckRegistration = async () => {
    if (!user) return;

    try {
      // Check if already registered
      const { data: existingReg } = await supabase
        .from('event_registrations')
        .select('id, qr_code')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingReg) {
        setIsAlreadyRegistered(true);
        setQrCode(existingReg.qr_code);
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData({
          email: profile.email || user.email || '',
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
        });
      } else {
        setFormData({
          email: user.email || '',
          firstName: '',
          lastName: '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to register');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('event-registration', {
        body: {
          eventId,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userId: user.id,
        },
      });

      if (error) throw error;

      setSuccess(true);
      setQrCode(data.qrCode);
      toast.success('Registration confirmed!');
      
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (success && qrCode) {
    return (
      <div className="space-y-4">
        <QRCodeDisplay 
          qrCode={qrCode}
          eventTitle={eventTitle}
          userName={`${formData.firstName} ${formData.lastName}`}
        />
        {isAlreadyRegistered && (
          <p className="text-sm text-muted-foreground text-center">
            You're already registered for this event!
          </p>
        )}
      </div>
    );
  }

  return (
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

      <Button type="submit" disabled={submitting} className="w-full" size="lg">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming Registration...
          </>
        ) : (
          'Confirm Registration'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your information will be used for event registration and check-in
      </p>
    </form>
  );
};

export default InlineRSVPForm;
