import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const BATCH_SIZE = 5; // Process 5 emails at a time
const RATE_LIMIT_DELAY = 600; // 600ms between emails = ~1.6 emails/second (under 2/sec limit)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[QUEUE-WORKER] Starting email queue processing...');

    // Fetch pending emails
    const { data: queuedEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .order('scheduled_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) throw fetchError;

    if (!queuedEmails || queuedEmails.length === 0) {
      console.log('[QUEUE-WORKER] No emails in queue');
      return new Response(
        JSON.stringify({ message: 'No emails in queue', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[QUEUE-WORKER] Processing ${queuedEmails.length} emails...`);

    let successCount = 0;
    let failCount = 0;

    for (const email of queuedEmails) {
      // Mark as processing
      await supabase
        .from('email_queue')
        .update({ status: 'processing', attempts: email.attempts + 1, updated_at: new Date().toISOString() })
        .eq('id', email.id);

      try {
        // Call appropriate email function based on type
        const functionName = email.email_type;
        
        console.log(`[QUEUE-WORKER] Invoking ${functionName} for ${email.recipient_email}`);
        
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: email.payload
        });

        if (error) throw error;

        // Mark as sent
        await supabase
          .from('email_queue')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString(),
            error_message: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);

        successCount++;
        console.log(`[QUEUE-WORKER] ✓ Sent ${email.email_type} to ${email.recipient_email}`);

      } catch (error: any) {
        failCount++;
        console.error(`[QUEUE-WORKER] ✗ Failed ${email.email_type} to ${email.recipient_email}:`, error.message);

        // Mark as failed if max attempts reached
        const newStatus = email.attempts >= 2 ? 'failed' : 'pending';
        
        await supabase
          .from('email_queue')
          .update({ 
            status: newStatus,
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);
      }

      // Rate limiting: wait between emails
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }

    return new Response(
      JSON.stringify({ 
        message: 'Queue processing complete',
        processed: queuedEmails.length,
        success: successCount,
        failed: failCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[QUEUE-WORKER] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
