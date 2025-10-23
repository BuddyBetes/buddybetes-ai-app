import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import QRCode from "npm:qrcode@1.5.3";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createBaseTemplate } from '../_shared/email-templates/base-template.ts';
import { createInfoBox, createDivider } from '../_shared/email-templates/components.ts';
import { emailStyles } from '../_shared/email-templates/styles.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  eventTitle: string;
  qrCode: string;
  eventDate: string | null;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, eventTitle, eventDate, qrCode, userId }: EmailRequest = await req.json();

    console.log("Sending event registration email:", { firstName, lastName, email, eventTitle });

    // Format event date if available
    const formattedDate = eventDate 
      ? new Date(eventDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "To be announced";

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrCode, { 
      width: 600,
      margin: 2,
      type: 'png',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const eventDetails = `
      <div style="margin: 20px 0;">
        <p style="${emailStyles.text}"><strong>📅 Date:</strong> ${formattedDate}</p>
      </div>
    `;

    const bodyContent = `
      <p style="${emailStyles.text}">
        You're confirmed for <strong>${eventTitle}</strong>! We're excited to see you there.
      </p>
      
      ${createInfoBox('Event Details', eventDetails)}
      
      ${createDivider()}
      
      <div style="text-align: center; margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
        <h2 style="font-size: 24px; font-weight: bold; color: #ffffff; margin: 0 0 16px 0;">Your Event QR Code</h2>
        <p style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">
          The attached PNG file below is your QR code for event check-in.
        </p>
        <p style="color: #ffffff; font-size: 14px; margin: 0; opacity: 0.9;">
          💾 Please save the attached file to your device and present it at the event entrance.
        </p>
      </div>
      
      ${createDivider()}
      
      <p style="${emailStyles.text}">
        If you have any questions, please don't hesitate to reach out to our team.
      </p>
    `;

    const htmlContent = createBaseTemplate({
      headerTitle: 'Event Registration Confirmed! 🎉',
      greeting: `Hi ${firstName} ${lastName}!`,
      bodyContent,
      footerText: 'See you at the event!'
    });

    const emailResponse = await resend.emails.send({
      from: "BuddyBetes Events <events@buddybetes.com>",
      to: [email],
      subject: `Event Registration Confirmed - ${eventTitle}`,
      html: htmlContent,
      attachments: [
        {
          filename: `event-qr-${firstName}-${lastName}.png`,
          content: qrCodeBuffer,
        }
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    // Log email to database if userId is provided
    if (userId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabaseClient.from('email_logs').insert({
          user_id: userId,
          email_type: 'event_registration',
          recipient_email: email,
          subject: `Event Registration Confirmed - ${eventTitle}`,
          status: 'sent',
          resend_message_id: emailResponse.id,
          metadata: { event_title: eventTitle, event_date: eventDate }
        });
      } catch (logError) {
        console.error('Error logging email:', logError);
      }
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-event-registration-email:", error);
    
    // Log failed email to database if possible
    try {
      const { email, userId } = await error.request?.json() || {};
      if (userId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabaseClient.from('email_logs').insert({
          user_id: userId,
          email_type: 'event_registration',
          recipient_email: email || 'unknown',
          subject: 'Event Registration Email',
          status: 'failed',
          error_message: error.message
        });
      }
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }
    
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
