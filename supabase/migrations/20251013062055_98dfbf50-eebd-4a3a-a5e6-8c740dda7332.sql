-- Update trigger functions to invoke payment email edge functions

-- Function to send payment receipt email via edge function
CREATE OR REPLACE FUNCTION public.notify_payment_receipt_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the invoke-payment-email edge function
  PERFORM
    net.http_post(
      url := 'https://zjqiikollqinafveesvo.supabase.co/functions/v1/invoke-payment-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key', true)
      ),
      body := jsonb_build_object(
        'receiptId', NEW.id,
        'emailType', 'payment_receipt'
      )
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block the insert
    RAISE WARNING 'Failed to invoke payment receipt email: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Function to send payment verified email via edge function
CREATE OR REPLACE FUNCTION public.notify_payment_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the invoke-payment-email edge function
  PERFORM
    net.http_post(
      url := 'https://zjqiikollqinafveesvo.supabase.co/functions/v1/invoke-payment-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key', true)
      ),
      body := jsonb_build_object(
        'receiptId', NEW.id,
        'emailType', 'payment_verified'
      )
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block the update
    RAISE WARNING 'Failed to invoke payment verified email: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure pg_net extension is enabled (for http_post)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configure service role key for edge function calls
-- Note: This should be set via ALTER DATABASE SET or Supabase dashboard
-- ALTER DATABASE postgres SET app.settings.supabase_service_role_key = 'your-service-role-key';
