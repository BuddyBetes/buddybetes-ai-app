import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvokePaymentEmailRequest {
  receiptId: string;
  emailType: 'payment_receipt' | 'payment_verified';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receiptId, emailType }: InvokePaymentEmailRequest = await req.json();

    console.log(`Processing ${emailType} email for receipt: ${receiptId}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch receipt details
    const { data: receipt, error: receiptError } = await supabaseClient
      .from('payment_receipts')
      .select(`
        *,
        profiles!payment_receipts_user_id_fkey(email, first_name, last_name),
        user_subscriptions!payment_receipts_subscription_id_fkey(
          tier_id,
          expires_at,
          subscription_tiers(name, duration_days)
        )
      `)
      .eq('id', receiptId)
      .single();

    if (receiptError || !receipt) {
      throw new Error(`Receipt not found: ${receiptError?.message}`);
    }

    const profile = receipt.profiles as any;
    const subscription = receipt.user_subscriptions as any;
    const tier = subscription?.subscription_tiers as any;

    // Determine which email function to call
    const functionName = emailType === 'payment_receipt' 
      ? 'send-payment-receipt' 
      : 'send-payment-verified';

    // Invoke the appropriate email function
    const { data: emailData, error: emailError } = await supabaseClient.functions.invoke(
      functionName,
      {
        body: {
          email: profile.email,
          firstName: profile.first_name || 'Valued',
          lastName: profile.last_name || 'Customer',
          amount: receipt.amount,
          paymentMethod: receipt.payment_method,
          referenceNumber: receipt.reference_number,
          tierName: tier?.name || 'Premium',
          durationDays: tier?.duration_days || 30,
          userId: receipt.user_id,
        }
      }
    );

    if (emailError) {
      console.error(`Error invoking ${functionName}:`, emailError);
      throw emailError;
    }

    console.log(`${emailType} email sent successfully:`, emailData);

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in invoke-payment-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
