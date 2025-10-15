import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";
import { createBuddyBetesPromoEmail } from "../_shared/email-templates/buddybetes-promo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SendEmailBlastRequest {
  campaignId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin authorization
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin", {
      _user_id: user.id,
    });

    if (adminError || !isAdmin) {
      console.error("Admin check failed:", adminError);
      
      // Log unauthorized attempt
      await supabase.from("admin_activity_logs").insert({
        admin_user_id: user.id,
        action: "unauthorized_email_blast_attempt",
        resource: "send-email-blast",
        metadata: { error: "Not an admin" }
      });

      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { campaignId }: SendEmailBlastRequest = await req.json();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign fetch error:", campaignError);
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update campaign status to sending
    await supabase
      .from("email_campaigns")
      .update({ 
        status: "sending", 
        started_at: new Date().toISOString() 
      })
      .eq("id", campaignId);

    // Log activity
    await supabase.from("admin_activity_logs").insert({
      admin_user_id: user.id,
      action: "start_email_campaign",
      resource: `campaign:${campaignId}`,
      metadata: { campaign_name: campaign.campaign_name }
    });

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, first_name");

    if (profilesError || !profiles) {
      console.error("Profiles fetch error:", profilesError);
      await supabase
        .from("email_campaigns")
        .update({ status: "failed" })
        .eq("id", campaignId);
      
      return new Response(
        JSON.stringify({ error: "Failed to fetch recipients" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter out profiles without email
    const validProfiles = profiles.filter(p => p.email);

    // Create recipient records
    const recipients = validProfiles.map(profile => ({
      campaign_id: campaignId,
      user_id: profile.id,
      email: profile.email,
      status: "pending"
    }));

    const { error: recipientsError } = await supabase
      .from("email_campaign_recipients")
      .insert(recipients);

    if (recipientsError) {
      console.error("Recipients insert error:", recipientsError);
    }

    // Update campaign recipient count
    await supabase
      .from("email_campaigns")
      .update({ recipient_count: validProfiles.length })
      .eq("id", campaignId);

    // Send emails in batches
    const BATCH_SIZE = 50;
    const BATCH_DELAY = 1000; // 1 second between batches
    
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < validProfiles.length; i += BATCH_SIZE) {
      const batch = validProfiles.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (profile) => {
        try {
          const appUrl = `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "")}/dashboard` || "https://buddybetes.com";
          const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(profile.email)}`;
          
          const html = createBuddyBetesPromoEmail({
            firstName: profile.first_name || undefined,
            appUrl,
            unsubscribeUrl
          });

          const response = await resend.emails.send({
            from: "BuddyBetes <hello@buddybetes.com>",
            to: profile.email,
            subject: campaign.subject,
            html,
          });

          // Update recipient status
          await supabase
            .from("email_campaign_recipients")
            .update({
              status: response.error ? "failed" : "sent",
              sent_at: new Date().toISOString(),
              resend_message_id: response.data?.id,
              error_message: response.error?.message,
            })
            .eq("campaign_id", campaignId)
            .eq("email", profile.email);

          // Log to email_logs
          await supabase.from("email_logs").insert({
            user_id: profile.id,
            recipient_email: profile.email,
            email_type: campaign.email_type,
            subject: campaign.subject,
            status: response.error ? "failed" : "sent",
            resend_message_id: response.data?.id,
            error_message: response.error?.message,
            metadata: { campaign_id: campaignId }
          });

          if (response.error) {
            failedCount++;
          } else {
            sentCount++;
          }
        } catch (error) {
          console.error(`Failed to send email to ${profile.email}:`, error);
          failedCount++;
          
          // Update recipient status
          await supabase
            .from("email_campaign_recipients")
            .update({
              status: "failed",
              error_message: error.message,
            })
            .eq("campaign_id", campaignId)
            .eq("email", profile.email);
        }
      });

      await Promise.all(promises);

      // Update campaign progress
      await supabase
        .from("email_campaigns")
        .update({ 
          sent_count: sentCount,
          failed_count: failedCount 
        })
        .eq("id", campaignId);

      // Delay between batches (except for last batch)
      if (i + BATCH_SIZE < validProfiles.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    // Update campaign status to completed
    await supabase
      .from("email_campaigns")
      .update({ 
        status: "completed",
        completed_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount
      })
      .eq("id", campaignId);

    // Log completion
    await supabase.from("admin_activity_logs").insert({
      admin_user_id: user.id,
      action: "complete_email_campaign",
      resource: `campaign:${campaignId}`,
      metadata: { 
        sent_count: sentCount, 
        failed_count: failedCount,
        total: validProfiles.length 
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: validProfiles.length
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-email-blast:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
