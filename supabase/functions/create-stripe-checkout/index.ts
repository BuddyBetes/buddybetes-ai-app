
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { tierId, discountCodeId } = await req.json();
    logStep("Request data received", { tierId, discountCodeId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Get tier details for pricing
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: tier, error: tierError } = await supabaseService
      .from("subscription_tiers")
      .select("*, stripe_price_id, stripe_price_id_discounted")
      .eq("id", tierId)
      .single();

    if (tierError || !tier) {
      throw new Error("Invalid subscription tier");
    }

    let discountCode = null;
    let priceId = tier.stripe_price_id;

    // Handle discount code if provided
    if (discountCodeId) {
      const { data: discount, error: discountError } = await supabaseService
        .from("discount_codes")
        .select("*")
        .eq("id", discountCodeId)
        .single();

      if (discountError || !discount) {
        throw new Error("Invalid discount code");
      }

      discountCode = discount;
      // Use the discounted price if available and if it's the PDS30 discount
      if (discount.code === 'PDS30' && tier.stripe_price_id_discounted) {
        priceId = tier.stripe_price_id_discounted;
        logStep("PDS30 discount applied - using discounted product", { priceId });
      } else {
        logStep("Discount applied", { discountPercentage: discount.discount_percentage });
      }
    }

    // Get the origin for the success URL
    const origin = req.headers.get("origin") || "http://localhost:3000";
    logStep("Origin detected", { origin });

    // Create subscription session using predefined Stripe price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription", // Recurring subscription
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription?payment=cancelled`,
      metadata: {
        user_id: user.id,
        tier_id: tierId,
        discount_code_id: discountCodeId || "",
        discount_code: discountCode?.code || "",
      },
    });

    logStep("Stripe checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-stripe-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
