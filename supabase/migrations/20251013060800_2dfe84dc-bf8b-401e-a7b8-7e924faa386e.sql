-- Phase 9: Email Tracking & Analytics
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'confirmation', 'password_reset', 'payment_receipt', 'event_registration', 'payment_verified'
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
  resend_message_id TEXT,
  error_message TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at DESC);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all email logs
CREATE POLICY "Admins can view all email logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Users can view their own email logs
CREATE POLICY "Users can view their own email logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role can insert email logs
CREATE POLICY "Service can insert email logs"
ON public.email_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Phase 7: Database Triggers for Payment Receipt Emails
CREATE OR REPLACE FUNCTION public.notify_payment_receipt_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function is called by trigger, but actual email sending
  -- will be handled by the application layer to avoid complex
  -- database-to-edge-function communication
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_payment_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function is called by trigger, but actual email sending
  -- will be handled by the application layer
  RETURN NEW;
END;
$$;

-- Triggers for payment events (lightweight - actual sending in app layer)
CREATE TRIGGER on_payment_receipt_created
  AFTER INSERT ON public.payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_payment_receipt_created();

CREATE TRIGGER on_payment_receipt_verified
  AFTER UPDATE ON public.payment_receipts
  FOR EACH ROW
  WHEN (NEW.verification_status = 'approved' AND OLD.verification_status != 'approved')
  EXECUTE FUNCTION public.notify_payment_verified();