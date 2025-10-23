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

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
  otp?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl, otp }: PasswordResetRequest = await req.json();
    
    const bodyContent = `
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 20px 0;">
        We received a request to reset your BuddyBetes account password.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 20px 0;">
        Click the button below to create a new password:
      </p>
      
      ${createButton('Reset Your Password', resetUrl)}
      
      ${otp ? `
        <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 20px 0;">
          Or use this one-time code:
        </p>
        <div style="background: linear-gradient(135deg, rgba(53, 202, 180, 0.15) 0%, rgba(32, 134, 135, 0.15) 100%); border: 2px dashed #35cab4; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0;">
          <p style="font-size: 14px; color: #208687; font-weight: 600; margin: 0 0 12px 0;">
            ONE-TIME PASSWORD
          </p>
          <p style="font-size: 36px; font-weight: bold; color: #208687; letter-spacing: 6px; margin: 0;">
            ${otp}
          </p>
          <p style="font-size: 14px; color: #208687; margin: 12px 0 0 0;">
            ⏱️ Expires in 1 hour
          </p>
        </div>
      ` : ''}
      
      ${createSecurityNote('This password reset link will expire in 1 hour. If you didn\'t request a password reset, please ignore this email and your password will remain unchanged.')}
      
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 20px 0 0 0;">
        For security reasons:
      </p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          Never share this link with anyone
        </li>
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          Make sure you're on the official BuddyBetes website
        </li>
        <li style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 8px;">
          Choose a strong, unique password
        </li>
      </ul>
    `;

    const html = createBaseTemplate({
      headerTitle: 'Reset Your Password 🔐',
      greeting: `Hi there!`,
      bodyContent,
      footerText: 'Need help? Contact our support team.'
    });

    const emailResponse = await sendEmailDirectOrQueue(
      () => sendEmailWithRetry(() => resend.emails.send({
        from: Deno.env.get('RESEND_FROM_EMAIL') || "BuddyBetes <noreply@buddybetes.com>",
        to: [email],
        subject: "🔐 Reset Your BuddyBetes Password (Expires in 1h)",
        html,
      })),
      'send-password-reset',
      email,
      { email, resetUrl, otp }
    );

    // Log email to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('email_logs').insert({
      recipient_email: email,
      email_type: 'password_reset',
      subject: 'Reset Your BuddyBetes Password',
      status: emailResponse.error ? 'failed' : 'sent',
      resend_message_id: emailResponse.data?.id,
      error_message: emailResponse.error?.message,
      metadata: { hasOtp: !!otp }
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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
