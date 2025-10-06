-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  video_url TEXT,
  max_attendees INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  qr_code TEXT NOT NULL UNIQUE,
  registration_type TEXT NOT NULL CHECK (registration_type IN ('new_user', 'existing_user')),
  email_sent BOOLEAN NOT NULL DEFAULT false,
  checked_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);

-- Create pending_accounts table for temporary user data
CREATE TABLE public.pending_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  verification_token TEXT NOT NULL UNIQUE,
  event_registration_id UUID REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events (public read, admin write)
CREATE POLICY "Anyone can view active events"
  ON public.events FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for event_registrations
CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can insert registrations"
  ON public.event_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all registrations"
  ON public.event_registrations FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update registrations"
  ON public.event_registrations FOR UPDATE
  USING (is_admin(auth.uid()));

-- RLS Policies for pending_accounts
CREATE POLICY "Anyone can view their pending account by token"
  ON public.pending_accounts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert pending accounts"
  ON public.pending_accounts FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX idx_event_registrations_email ON public.event_registrations(email);
CREATE INDEX idx_event_registrations_qr_code ON public.event_registrations(qr_code);
CREATE INDEX idx_pending_accounts_email ON public.pending_accounts(email);
CREATE INDEX idx_pending_accounts_token ON public.pending_accounts(verification_token);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_events_updated_at();