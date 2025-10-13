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
    const { email, firstName, lastName, eventTitle, qrCode, eventDate, userId }: EmailRequest = await req.json();

    console.log("Generating QR code image for:", qrCode);
    
    // Generate QR code as base64 image
    const qrCodeDataUrl = await QRCode.toDataURL(qrCode, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

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

    // Build email content using shared components
    const qrCodeSection = `
      <div style="text-align: center; margin: 30px 0;">
        <img src="${qrCodeDataUrl}" alt="Event QR Code" style="max-width: 300px; width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
        <p style="${emailStyles.text}">Present this QR code at the event for quick check-in</p>
      </div>
    `;

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
      
      <h2 style="font-size: 20px; font-weight: bold; color: #333; margin: 30px 0 20px 0;">Your Check-in QR Code</h2>
      ${qrCodeSection}
      
      ${createDivider()}
      
      <p style="${emailStyles.text}">
        <strong>Important:</strong> Save this email or take a screenshot of your QR code. You'll need it to check in at the event.
      </p>
      
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
