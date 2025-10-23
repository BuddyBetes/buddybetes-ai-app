import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export async function queueEmail(
  emailType: string,
  recipientEmail: string,
  payload: any
): Promise<void> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { error } = await supabase.from('email_queue').insert({
    email_type: emailType,
    recipient_email: recipientEmail,
    payload: payload,
    status: 'pending'
  });

  if (error) {
    console.error('[QUEUE] Failed to queue email:', error);
    throw error;
  }

  console.log(`[QUEUE] Queued ${emailType} for ${recipientEmail}`);
}

export async function sendEmailDirectOrQueue(
  sendFunction: () => Promise<any>,
  emailType: string,
  recipientEmail: string,
  payload: any
): Promise<any> {
  try {
    // Try to send directly first
    const result = await sendFunction();
    
    // If rate limited, queue it instead
    if (result.error?.message?.includes('rate limit')) {
      console.log(`[EMAIL] Rate limited, queuing ${emailType} for ${recipientEmail}`);
      await queueEmail(emailType, recipientEmail, payload);
      return { data: { id: 'queued' }, error: null };
    }
    
    return result;
  } catch (error: any) {
    // On any error, queue for retry
    console.error(`[EMAIL] Error sending ${emailType}, queuing for retry:`, error.message);
    await queueEmail(emailType, recipientEmail, payload);
    return { data: { id: 'queued' }, error: null };
  }
}
