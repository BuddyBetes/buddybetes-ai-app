import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { createBaseTemplate } from '../_shared/email-templates/base-template.ts';
import { createBadge, createButton } from '../_shared/email-templates/components.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentVerifiedRequest {
  receiptId: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receiptId, userId }: PaymentVerifiedRequest = await req.json();

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
          expires_at,
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
    const expiresAt = receipt.user_subscriptions?.expires_at 
      ? new Date(receipt.user_subscriptions.expires_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Never';

    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('https://zjqiikollqinafveesvo.supabase.co', 'https://app.buddybetes.com') || 'https://app.buddybetes.com';

    const bodyContent = `
      <div style="text-align: center; margin: 30px 0; padding: 40px 20px; background: linear-gradient(135deg, rgba(53, 202, 180, 0.15) 0%, rgba(32, 134, 135, 0.15) 100%); border-radius: 16px; border: 2px solid #35cab4;">
        <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
        <h2 style="font-size: 28px; font-weight: bold; color: #208687; margin: 0 0 12px 0;">
          Payment Approved!
        </h2>
        <p style="font-size: 18px; line-height: 1.6; color: #208687; font-weight: 600; margin: 0;">
          Your subscription is now active
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 20px 0;">
        Your <strong>${tierName}</strong> subscription is now active! You have full access to all premium features.
      </p>
      
      <div style="background: white; border: 2px solid rgba(53, 202, 180, 0.3); border-radius: 12px; padding: 25px; margin: 30px 0;">
        <p style="font-size: 16px; color: #208687; font-weight: 600; margin: 0 0 15px 0;">
          📅 Subscription Details
        </p>
        <p style="font-size: 14px; color: #666; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <strong style="color: #333;">Plan:</strong> ${tierName}
        </p>
        <p style="font-size: 14px; color: #666; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <strong style="color: #333;">Amount:</strong> ₱${Number(receipt.amount).toFixed(2)}
        </p>
        <p style="font-size: 14px; color: #666; margin: 8px 0; padding: 8px 0;">
          <strong style="color: #333;">Valid Until:</strong> ${expiresAt}
        </p>
      </div>
      
      ${createButton('Start Using Premium Features', appUrl)}
      
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 20px 0;">
        Here's what you can now enjoy:
      </p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          🤖 <strong>Advanced AI Insights:</strong> Get personalized recommendations based on your data
        </li>
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          📊 <strong>Detailed Analytics:</strong> View comprehensive trends and patterns
        </li>
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          📸 <strong>Unlimited Meal Analysis:</strong> Scan as many meals as you want
        </li>
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          💬 <strong>Priority Support:</strong> Get help faster when you need it
        </li>
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          📈 <strong>Export Reports:</strong> Download your health data anytime
        </li>
      </ul>
      
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 30px 0 0 0;">
        Thank you for supporting BuddyBetes! We're committed to helping you manage your diabetes better. 💙
      </p>
    `;

    const html = createBaseTemplate({
      headerTitle: 'Payment Verified! 🎉',
      greeting: `Hi ${userName}!`,
      bodyContent,
      footerText: 'Welcome to premium! We\'re here if you need anything.'
    });

    const emailResponse = await resend.emails.send({
      from: "BuddyBetes <payments@resend.dev>",
      to: [email],
      subject: `✅ Payment Approved - ${tierName} Subscription Active`,
      html,
    });

    // Log email to database
    await supabase.from('email_logs').insert({
      user_id: userId,
      recipient_email: email,
      email_type: 'payment_verified',
      subject: `✅ Payment Approved - ${tierName} Subscription Active`,
      status: emailResponse.error ? 'failed' : 'sent',
      resend_message_id: emailResponse.data?.id,
      error_message: emailResponse.error?.message,
      metadata: { receiptId, tierName, amount: receipt.amount }
    });

    console.log("Payment verified email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-payment-verified function:", error);
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
