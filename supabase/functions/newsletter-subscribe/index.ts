import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  firstName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName }: SubscribeRequest = await req.json();

    console.log(`Attempting to subscribe ${email} (${firstName}) to newsletter`);

    // Create form data for Mailchimp
    const formData = new FormData();
    formData.append('EMAIL', email);
    formData.append('FNAME', firstName);
    formData.append('b_cfbc83a07a3542e2559bace72_c81e3803c2', ''); // honeypot field

    // Submit to Mailchimp
    const mailchimpResponse = await fetch(
      'https://buddybetes.us22.list-manage.com/subscribe/post?u=cfbc83a07a3542e2559bace72&id=c81e3803c2&f_id=0001cfe1f0',
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log(`Mailchimp response status: ${mailchimpResponse.status}`);
    
    // Check if the response indicates success
    const responseText = await mailchimpResponse.text();
    console.log(`Mailchimp response text preview: ${responseText.substring(0, 200)}`);

    // Mailchimp returns HTML, but we can check for success indicators
    const isSuccess = responseText.includes('success') || 
                     responseText.includes('confirm') || 
                     responseText.includes('Thank you') ||
                     mailchimpResponse.status === 200;

    if (isSuccess) {
      console.log('Newsletter subscription successful');
      return new Response(
        JSON.stringify({ success: true, message: 'Successfully subscribed to newsletter' }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } else {
      console.log('Newsletter subscription may have failed');
      return new Response(
        JSON.stringify({ success: false, message: 'Subscription status unknown' }),
        {
          status: 200, // Still return 200 since this shouldn't block onboarding
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in newsletter subscription:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);