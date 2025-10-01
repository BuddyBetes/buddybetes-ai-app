import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  type: 'verification' | 'qr_code';
  email: string;
  firstName: string;
  verificationToken?: string;
  qrCode?: string;
  eventId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, firstName, verificationToken, qrCode, eventId }: EmailRequest = await req.json();
    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://') || 'http://localhost:5173';

    let subject: string;
    let html: string;

    if (type === 'verification') {
      subject = "Verify your BuddyBetes account for event registration";
      const verificationUrl = `${appUrl}/verify-account?token=${verificationToken}&eventId=${eventId}`;
      
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Welcome to BuddyBetes, ${firstName}!</h1>
          <p>Thank you for registering for our event. To complete your registration and create your BuddyBetes account, please verify your email address.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email & Create Account
            </a>
          </div>
          <p style="color: #666;">This link will expire in 24 hours.</p>
          <p style="color: #666;">After verification, you'll receive your event QR code for the raffle entry.</p>
        </div>
      `;
    } else {
      subject = "Your BuddyBetes Event QR Code";
      
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Event Registration Confirmed!</h1>
          <p>Hi ${firstName},</p>
          <p>Thank you for confirming your attendance! Here's your unique QR code for the event raffle:</p>
          <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6; letter-spacing: 2px;">
              ${qrCode}
            </div>
            <p style="color: #666; margin-top: 10px;">Present this code at the event</p>
          </div>
          <p>We look forward to seeing you at the event!</p>
          <p style="color: #666; margin-top: 30px;">The BuddyBetes Team</p>
        </div>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: "BuddyBetes <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    if (error) throw error;

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
