import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { createBaseTemplate } from '../_shared/email-templates/base-template.ts';
import { createButton, createSecurityNote } from '../_shared/email-templates/components.ts';

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
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 20px 0;">
        We're excited to have you on board! 🎉
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 20px 0;">
        BuddyBetes is your personal diabetes management companion, helping you track glucose levels, 
        meals, and get AI-powered insights to better manage your health.
      </p>
      
      ${createButton('Confirm Your Email', confirmationUrl)}
      
      ${createSecurityNote('This confirmation link will expire in 24 hours. If you didn\'t create an account with BuddyBetes, you can safely ignore this email.')}
      
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 20px 0 0 0;">
        Once confirmed, you'll be able to:
      </p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          📊 Track your glucose levels and health data
        </li>
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          🤖 Get AI-powered insights and recommendations
        </li>
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          📸 Analyze meals with photo recognition
        </li>
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          📈 View trends and patterns in your data
        </li>
      </ul>
    `;

    const html = createBaseTemplate({
      headerTitle: 'Welcome to BuddyBetes! 🎉',
      greeting: `Hi ${userName}!`,
      bodyContent,
      footerText: 'Thank you for joining our community!'
    });

    const emailResponse = await resend.emails.send({
      from: "BuddyBetes <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to BuddyBetes - Confirm Your Email",
      html,
    });

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
