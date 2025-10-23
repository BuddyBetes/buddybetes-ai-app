import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { createBaseTemplate } from '../_shared/email-templates/base-template.ts';
import { sendEmailWithRetry } from '../_shared/email-retry.ts';
import { sendEmailDirectOrQueue } from '../_shared/email-queue-helper.ts';
import { createInfoBox, createBadge, createTable, createSecurityNote } from '../_shared/email-templates/components.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentReceiptRequest {
  receiptId: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receiptId, userId }: PaymentReceiptRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch payment receipt details
    const { data: receipt, error: receiptError } = await supabase
      .from('payment_receipts')
      .select(`
        *,
        user_subscriptions (
          tier_id,
          subscription_tiers (
            name,
            duration_days
          )
        )
      `)
      .eq('id', receiptId)
      .single();

    if (receiptError || !receipt) {
      throw new Error('Receipt not found');
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    const userName = profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}` 
      : 'there';

    const email = profile?.email || '';
    const tierName = receipt.user_subscriptions?.subscription_tiers?.name || 'Premium';
    const paymentMethod = receipt.payment_method === 'gcash' ? 'GCash' : 
                          receipt.payment_method === 'bpi' ? 'BPI' : 
                          receipt.payment_method;
    
    const isManualPayment = receipt.payment_method === 'gcash' || receipt.payment_method === 'bpi';
    const statusBadge = isManualPayment 
      ? createBadge('Under Review', 'warning') 
      : createBadge('Payment Confirmed', 'success');

    const paymentDetails = createTable([
      { label: 'Subscription Plan', value: tierName },
      { label: 'Amount Paid', value: `₱${Number(receipt.amount).toFixed(2)}` },
      { label: 'Payment Method', value: paymentMethod },
      { label: 'Transaction Date', value: new Date(receipt.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) },
      ...(receipt.reference_number ? [{ label: 'Reference Number', value: receipt.reference_number }] : [])
    ]);

    const bodyContent = `
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 20px 0;">
        Thank you for subscribing to BuddyBetes ${tierName}! We've received your payment and your subscription is being processed.
      </p>
      
      <div style="background: linear-gradient(135deg, rgba(53, 202, 180, 0.1) 0%, rgba(32, 134, 135, 0.1) 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border: 2px solid rgba(53, 202, 180, 0.3);">
        <p style="font-size: 16px; color: #208687; font-weight: 600; margin: 0 0 15px 0;">
          📝 Payment Details
        </p>
        <div style="background: white; border-radius: 8px; padding: 15px;">
          <p style="font-size: 14px; color: #666; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
            <strong style="color: #333;">Plan:</strong> ${tierName}
          </p>
          <p style="font-size: 14px; color: #666; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
            <strong style="color: #333;">Amount:</strong> ₱${Number(receipt.amount).toFixed(2)}
          </p>
          <p style="font-size: 14px; color: #666; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
            <strong style="color: #333;">Payment Method:</strong> ${receipt.payment_method === 'gcash' ? '💳 GCash' : '🏦 Bank Transfer'}
          </p>
          <p style="font-size: 14px; color: #666; margin: 8px 0; padding: 8px 0;">
            <strong style="color: #333;">Reference Number:</strong> ${receipt.reference_number || 'N/A'}
          </p>
        </div>
      </div>
      
      ${isManualPayment ? `
        <div style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="font-size: 16px; color: #f57c00; font-weight: 600; margin: 0 0 10px 0;">
            ⏳ What happens next?
          </p>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="font-size: 14px; color: #666; margin-bottom: 8px;">
              Our team will verify your payment within 24 hours
            </li>
            <li style="font-size: 14px; color: #666; margin-bottom: 8px;">
              You'll receive a confirmation email once approved
            </li>
            <li style="font-size: 14px; color: #666; margin-bottom: 8px;">
              Your premium features will be activated immediately after verification
            </li>
          </ul>
        </div>
        
        ${createSecurityNote('Keep this email for your records. You may need the reference number for any payment inquiries.')}
      ` : `
        <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 20px 0;">
          🎉 Your payment has been confirmed! Your premium features are now active.
        </p>
      `}
    `;

    const html = createBaseTemplate({
      headerTitle: 'Payment Receipt - BuddyBetes 💳',
      greeting: `Hi ${userName}!`,
      bodyContent,
      footerText: 'Questions about your payment? Contact our support team.'
    });

    const emailResponse = await sendEmailDirectOrQueue(
      () => sendEmailWithRetry(() => resend.emails.send({
        from: Deno.env.get('RESEND_FROM_EMAIL') || "BuddyBetes <noreply@buddybetes.com>",
        to: [email],
        subject: `Payment Receipt - ${tierName} Subscription`,
        html,
      })),
      'send-payment-receipt',
      email,
      { receiptId, userId }
    );

    // Log email to database
    await supabase.from('email_logs').insert({
      user_id: userId,
      recipient_email: email,
      email_type: 'payment_receipt',
      subject: `Payment Receipt - ${tierName} Subscription`,
      status: emailResponse.error ? 'failed' : 'sent',
      resend_message_id: emailResponse.data?.id,
      error_message: emailResponse.error?.message,
      metadata: { receiptId, tierName, amount: receipt.amount, paymentMethod: receipt.payment_method }
    });

    console.log("Payment receipt email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-payment-receipt function:", error);
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
