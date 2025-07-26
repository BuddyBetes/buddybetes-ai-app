import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APPLY-DISCOUNT-CODE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { code, tierId } = await req.json();
    if (!code || !tierId) throw new Error("Discount code and tier ID are required");

    logStep("Applying discount code", { code, tierId, userId: user.id });

    // Get discount code details
    const { data: discountCode, error: codeError } = await supabaseClient
      .from("discount_codes")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .single();

    if (codeError || !discountCode) {
      throw new Error("Invalid discount code");
    }

    // Validate the discount code (same checks as validate function)
    if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
      throw new Error("Discount code has expired");
    }

    if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
      throw new Error("Discount code usage limit reached");
    }

    const { data: existingRedemption } = await supabaseClient
      .from("discount_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("discount_code_id", discountCode.id)
      .single();

    if (existingRedemption) {
      throw new Error("You have already used this discount code");
    }

    // Get tier details
    const { data: tier, error: tierError } = await supabaseClient
      .from("subscription_tiers")
      .select("*")
      .eq("id", tierId)
      .single();

    if (tierError || !tier) {
      throw new Error("Invalid subscription tier");
    }

    // For 100% discount, create subscription directly
    if (discountCode.discount_percentage === 100) {
      logStep("Creating free subscription", { discount_percentage: 100 });

      const subscriptionEndDate = discountCode.duration_days 
        ? new Date(Date.now() + (discountCode.duration_days * 24 * 60 * 60 * 1000))
        : null; // null means lifetime access

      // Create subscription
      const { data: subscription, error: subError } = await supabaseClient
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          tier_id: tierId,
          status: "active",
          payment_method: "discount_code",
          amount_paid: 0,
          starts_at: new Date().toISOString(),
          expires_at: subscriptionEndDate?.toISOString() || null
        })
        .select()
        .single();

      if (subError) {
        logStep("Error creating subscription", { error: subError });
        throw new Error("Failed to create subscription");
      }

      // Record redemption
      const { error: redemptionError } = await supabaseClient
        .from("discount_redemptions")
        .insert({
          user_id: user.id,
          discount_code_id: discountCode.id,
          subscription_id: subscription.id
        });

      if (redemptionError) {
        logStep("Error recording redemption", { error: redemptionError });
        // Don't fail the whole process for this
      }

      // Update discount code usage count
      const { error: updateError } = await supabaseClient
        .from("discount_codes")
        .update({ current_uses: discountCode.current_uses + 1 })
        .eq("id", discountCode.id);

      if (updateError) {
        logStep("Error updating discount code usage", { error: updateError });
        // Don't fail the whole process for this
      }

      logStep("Successfully applied 100% discount code", { 
        subscriptionId: subscription.id,
        expiresAt: subscriptionEndDate 
      });

      return new Response(JSON.stringify({
        success: true,
        subscription: subscription,
        discount_applied: discountCode.discount_percentage
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // For partial discounts, we'll need to handle this in the create-stripe-checkout function
      logStep("Partial discount code applied", { discount_percentage: discountCode.discount_percentage });
      
      return new Response(JSON.stringify({
        success: true,
        requires_payment: true,
        discount_applied: discountCode.discount_percentage,
        discount_code_id: discountCode.id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});