import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import QRCode from "npm:qrcode@1.5.3";

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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, eventTitle, qrCode, eventDate }: EmailRequest = await req.json();

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

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #35cab4 0%, #208687 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 20px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .event-details {
              background-color: #f9fafb;
              border-left: 4px solid #35cab4;
              padding: 20px;
              margin: 20px 0;
            }
            .event-details h2 {
              margin: 0 0 10px 0;
              color: #208687;
              font-size: 20px;
            }
            .event-details p {
              margin: 5px 0;
              color: #666;
            }
            .qr-section {
              text-align: center;
              margin: 30px 0;
            }
            .qr-section img {
              max-width: 300px;
              height: auto;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 10px;
            }
            .qr-instructions {
              color: #666;
              font-size: 14px;
              margin-top: 15px;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #35cab4;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Confirmed!</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hi ${firstName} ${lastName},</p>
              
              <p>Thank you for registering for our event! We're excited to have you join us.</p>
              
              <div class="event-details">
                <h2>${eventTitle}</h2>
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
              </div>
              
              <div class="qr-section">
                <h3 style="color: #208687; margin-bottom: 15px;">Your Event QR Code</h3>
                <img src="${qrCodeDataUrl}" alt="Event QR Code" />
                <p class="qr-instructions">
                  Please present this QR code at the event for check-in.<br/>
                  You can save this email or take a screenshot for easy access.
                </p>
              </div>
              
              <p style="margin-top: 30px;">
                <strong>Important Reminders:</strong>
              </p>
              <ul style="color: #666; line-height: 1.8;">
                <li>Save this QR code on your device</li>
                <li>Arrive 10-15 minutes early for check-in</li>
                <li>Bring a valid ID if required</li>
              </ul>
              
              <p style="margin-top: 30px; color: #666;">
                If you have any questions, feel free to reply to this email.
              </p>
            </div>
            
            <div class="footer">
              <p>This email was sent by BuddyBetes</p>
              <p>© ${new Date().getFullYear()} BuddyBetes. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "BuddyBetes Events <onboarding@resend.dev>",
      to: [email],
      subject: `Event Registration Confirmed - ${eventTitle}`,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-event-registration-email:", error);
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
