import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { createBaseTemplate } from '../_shared/email-templates/base-template.ts';
import { createButton, createSecurityNote } from '../_shared/email-templates/components.ts';
import { sendEmailWithRetry } from '../_shared/email-retry.ts';
import { sendEmailDirectOrQueue } from '../_shared/email-queue-helper.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailConfirmationRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, confirmationUrl }: EmailConfirmationRequest = await req.json();

    const userName = firstName && lastName ? `${firstName} ${lastName}` : 
                     firstName ? firstName : 'there';
    
    const bodyContent = `
      <p style="font-size: 18px; line-height: 1.6; color: #333; font-weight: 600; text-align: center; margin: 20px 0;">
        You're just one click away from getting started! 🎉
      </p>
      
      <div style="text-align: center; margin: 30px 0; padding: 30px; background: linear-gradient(135deg, rgba(53, 202, 180, 0.15) 0%, rgba(32, 134, 135, 0.15) 100%); border: 2px solid #35cab4; border-radius: 12px;">
        <h2 style="font-size: 24px; font-weight: bold; color: #208687; margin: 0 0 16px 0;">Confirm Your Email Address</h2>
        <p style="color: #208687; font-size: 16px; margin: 0 0 20px 0;">
          Click the button below to activate your BuddyBetes account.
        </p>
        ${createButton('Confirm My Account', confirmationUrl)}
        <p style="color: #208687; font-size: 14px; margin: 16px 0 0 0; font-weight: 600;">
          ⏱️ This link expires in 24 hours
        </p>
      </div>
      
      <div style="background: linear-gradient(135deg, rgba(53, 202, 180, 0.1) 0%, rgba(32, 134, 135, 0.1) 100%); border-left: 4px solid #35cab4; border-radius: 12px; padding: 25px; margin: 30px 0;">
        <p style="font-size: 16px; color: #208687; font-weight: 600; margin: 0 0 15px 0;">
          🌟 What You'll Get Access To:
        </p>
        <ul style="margin: 0; padding-left: 20px;">
          <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 10px;">
            📊 Track glucose levels with smart insights
          </li>
          <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 10px;">
            🤖 AI-powered health recommendations
          </li>
          <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 10px;">
            📸 Instant meal analysis with photo recognition
          </li>
          <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 10px;">
            📈 Personalized health trends and patterns
          </li>
        </ul>
      </div>
      
      ${createSecurityNote('If you didn\'t create a BuddyBetes account, you can safely ignore this email.')}
    `;

    const html = createBaseTemplate({
      headerTitle: 'Welcome to BuddyBetes! 🎉',
      greeting: `Hi ${userName}!`,
      bodyContent,
      footerText: 'Thank you for joining our community!'
    });

    const emailResponse = await sendEmailDirectOrQueue(
      () => sendEmailWithRetry(() => resend.emails.send({
        from: Deno.env.get('RESEND_FROM_EMAIL') || "BuddyBetes <noreply@buddybetes.com>",
        to: [email],
        subject: "⚡ Confirm Your BuddyBetes Account (Expires in 24h)",
        html,
      })),
      'send-email-confirmation',
      email,
      { email, firstName, lastName, confirmationUrl }
    );

    // Log email to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('email_logs').insert({
      recipient_email: email,
      email_type: 'confirmation',
      subject: 'Welcome to BuddyBetes - Confirm Your Email',
      status: emailResponse.error ? 'failed' : 'sent',
      resend_message_id: emailResponse.data?.id,
      error_message: emailResponse.error?.message,
      metadata: { firstName, lastName }
    });

    console.log("Email confirmation sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email-confirmation function:", error);
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
