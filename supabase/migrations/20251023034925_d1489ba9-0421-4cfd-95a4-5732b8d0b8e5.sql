-- Email queue for managing high-volume email sending
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled 
ON public.email_queue(status, scheduled_at) 
WHERE status = 'pending';

-- Index for monitoring failed emails
CREATE INDEX IF NOT EXISTS idx_email_queue_failed 
ON public.email_queue(status, updated_at) 
WHERE status = 'failed';

-- RLS policies
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access email queue
DROP POLICY IF EXISTS "Service role can manage email queue" ON public.email_queue;
CREATE POLICY "Service role can manage email queue"
ON public.email_queue
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);