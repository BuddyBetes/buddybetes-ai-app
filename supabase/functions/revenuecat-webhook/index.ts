import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { isSupabaseUserId, syncRevenueCatSubscriber } from "../_shared/revenuecat.ts";

// Receives RevenueCat webhooks (purchases, renewals, cancellations, expirations,
// refunds, transfers). Rather than interpreting each event type, every event
// triggers a re-sync of the affected users from the RevenueCat API.

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[REVENUECAT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Shared secret set as the Authorization header value in the RevenueCat dashboard
  const expectedAuth = Deno.env.get("REVENUECAT_WEBHOOK_AUTH");
  if (!expectedAuth || req.headers.get("Authorization") !== expectedAuth) {
    logStep("Unauthorized request");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { event } = await req.json();
    logStep("Event received", { type: event?.type, id: event?.id, environment: event?.environment });

    if (!event || event.type === "TEST") {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const candidateIds: unknown[] = [
      event.app_user_id,
      event.original_app_user_id,
      ...(event.aliases ?? []),
      ...(event.transferred_from ?? []),
      ...(event.transferred_to ?? []),
    ];
    const userIds = [...new Set(candidateIds.filter(isSupabaseUserId))];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    for (const userId of userIds) {
      try {
        const result = await syncRevenueCatSubscriber(supabase, userId);
        logStep("Synced user", { userId, ...result });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Deleted accounts can still receive Apple events; nothing to update
        if (message.includes("foreign key")) {
          logStep("Skipping deleted user", { userId });
          continue;
        }
        throw error;
      }
    }

    return new Response(JSON.stringify({ ok: true, synced: userIds.length }), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    // Non-2xx makes RevenueCat retry the delivery
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
