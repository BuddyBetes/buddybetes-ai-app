import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend";
import { createBaseTemplate } from "../_shared/email-templates/base-template.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the caller's JWT
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "No token provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const userEmail = user.email ?? "";

    // Grab the profile name for the confirmation email BEFORE anything is deleted
    let firstName = "";
    try {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("first_name")
        .eq("id", userId)
        .single();
      firstName = profile?.first_name ?? "";
    } catch (_) {
      // Non-fatal
    }

    // ---- Send the confirmation email BEFORE deletion (address is gone afterwards) ----
    try {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      const html = createBaseTemplate({
        headerTitle: "Account Deleted",
        greeting: `Hi ${firstName || "there"},`,
        bodyContent: `
          <p style="margin: 0 0 16px;">Your BuddyBetes account and all associated personal data have been permanently deleted, as you requested.</p>
          <p style="margin: 0 0 16px;">This includes your profile, health data, glucose logs, assistant history, and event registrations.</p>
          <p style="margin: 0;">If you did not request this deletion, please contact us immediately at support@buddybetes.com.</p>
        `,
        footerText: "You received this email because an account deletion request was completed for this address.",
      });

      await resend.emails.send({
        from: "BuddyBetes <noreply@buddybetes.com>",
        to: userEmail,
        subject: "Your BuddyBetes account has been deleted",
        html,
      });
    } catch (emailErr) {
      // Never block deletion because of an email failure
      console.error("Deletion confirmation email failed:", emailErr);
    }

    // ---- Delete user data ----
    // Order matters: children of foreign keys are removed before their parents.

    // email_analytics -> email_logs
    const { data: logIds } = await supabaseAdmin
      .from("email_logs")
      .select("id")
      .eq("user_id", userId);
    if (logIds && logIds.length > 0) {
      await supabaseAdmin
        .from("email_analytics")
        .delete()
        .in("email_log_id", logIds.map((l) => l.id));
    }
    await supabaseAdmin.from("email_logs").delete().eq("user_id", userId);

    // assistant_messages -> assistant_conversations
    const { data: convIds } = await supabaseAdmin
      .from("assistant_conversations")
      .select("id")
      .eq("user_id", userId);
    if (convIds && convIds.length > 0) {
      await supabaseAdmin
        .from("assistant_messages")
        .delete()
        .in("conversation_id", convIds.map((c) => c.id));
    }

    // event_registrations -> pending_accounts
    const { data: regIds } = await supabaseAdmin
      .from("event_registrations")
      .select("id")
      .eq("user_id", userId);
    if (regIds && regIds.length > 0) {
      await supabaseAdmin
        .from("pending_accounts")
        .delete()
        .in("event_registration_id", regIds.map((r) => r.id));
    }
    if (userEmail) {
      await supabaseAdmin.from("pending_accounts").delete().eq("email", userEmail);
    }

    // payment_receipts & discount_redemptions -> user_subscriptions
    await supabaseAdmin.from("payment_receipts").delete().eq("user_id", userId);
    await supabaseAdmin.from("discount_redemptions").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_subscriptions").delete().eq("user_id", userId);

    // user_activity_logs -> user_sessions
    await supabaseAdmin.from("user_activity_logs").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_sessions").delete().eq("user_id", userId);

    await supabaseAdmin.from("admin_activity_logs").delete().eq("admin_user_id", userId);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_notifications").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_retention_cohorts").delete().eq("user_id", userId);
    await supabaseAdmin.from("email_unsubscribes").delete().eq("user_id", userId);
    await supabaseAdmin.from("email_campaign_recipients").delete().eq("user_id", userId);

    // Detach campaigns the user created instead of deleting shared campaign records
    await supabaseAdmin.from("email_campaigns").update({ created_by: null }).eq("created_by", userId);

    if (userEmail) {
      await supabaseAdmin.from("email_queue").delete().eq("recipient_email", userEmail);
    }

    await supabaseAdmin.from("event_registrations").delete().eq("user_id", userId);
    await supabaseAdmin.from("glucose_logs").delete().eq("user_id", userId);
    await supabaseAdmin.from("health_data").delete().eq("user_id", userId);
    await supabaseAdmin.from("assistant_conversations").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // ---- Delete the auth account itself ----
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Auth user deletion failed:", deleteUserError);
      return new Response(
        JSON.stringify({ error: "Failed to delete account", details: deleteUserError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in delete-account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
