-- Create email campaigns table
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  campaign_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT DEFAULT 'marketing',
  template_html TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create email campaign recipients table
CREATE TABLE email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  resend_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create admin activity logs table
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  resource TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_campaigns
CREATE POLICY "Admins can manage campaigns"
ON email_campaigns FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- RLS Policies for email_campaign_recipients
CREATE POLICY "Admins can manage recipients"
ON email_campaign_recipients FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- RLS Policies for admin_activity_logs
CREATE POLICY "Admins can view activity logs"
ON admin_activity_logs FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert activity logs"
ON admin_activity_logs FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Add realtime support for campaigns
ALTER PUBLICATION supabase_realtime ADD TABLE email_campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE email_campaign_recipients;