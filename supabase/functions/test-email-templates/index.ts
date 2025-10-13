import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  emailType: 'confirmation' | 'password_reset' | 'payment_receipt' | 'payment_verified' | 'event_registration';
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { emailType, recipientEmail }: TestEmailRequest = await req.json();

    // Call appropriate email function based on type
    let functionName = '';
    let body: any = {};

    switch (emailType) {
      case 'confirmation':
        functionName = 'send-email-confirmation';
        body = {
          email: recipientEmail,
          firstName: 'Test',
          lastName: 'User',
          confirmationUrl: 'https://app.buddybetes.com/confirm?test=true'
        };
        break;

      case 'password_reset':
        functionName = 'send-password-reset';
        body = {
          email: recipientEmail,
          resetUrl: 'https://app.buddybetes.com/reset-password?test=true',
          otp: '123456'
        };
        break;

      case 'payment_receipt':
        functionName = 'send-payment-receipt';
        // Create a test receipt
        const { data: testReceipt } = await supabase
          .from('payment_receipts')
          .insert({
            user_id: user.id,
            subscription_id: '00000000-0000-0000-0000-000000000000',
            amount: 299.00,
            payment_method: 'gcash',
            receipt_url: 'https://example.com/test-receipt.jpg',
            reference_number: 'TEST123456',
            verification_status: 'pending'
          })
          .select()
          .single();

        body = {
          receiptId: testReceipt?.id,
          userId: user.id
        };
        break;

      case 'payment_verified':
        functionName = 'send-payment-verified';
        // Use existing receipt or create one
        const { data: verifiedReceipt } = await supabase
          .from('payment_receipts')
          .select()
          .eq('user_id', user.id)
          .limit(1)
          .single();

        body = {
          receiptId: verifiedReceipt?.id || '00000000-0000-0000-0000-000000000000',
          userId: user.id
        };
        break;

      case 'event_registration':
        functionName = 'send-event-registration-email';
        body = {
          email: recipientEmail,
          firstName: 'Test',
          lastName: 'User',
          eventTitle: 'Test Event',
          eventDate: new Date().toISOString(),
          eventLocation: 'Test Location',
          qrCodeData: `test-qr-${Date.now()}`
        };
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid email type' }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    // Invoke the email function
    const { data, error } = await supabase.functions.invoke(functionName, {
      body
    });

    if (error) throw error;

    console.log(`Test email sent successfully: ${emailType}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Test ${emailType} email sent to ${recipientEmail}`,
      data 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in test-email-templates function:", error);
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
