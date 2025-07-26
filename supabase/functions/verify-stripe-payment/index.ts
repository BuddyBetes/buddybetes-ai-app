
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
  console.log(`[VERIFY-STRIPE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Use service role key to update subscription data
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
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { sessionId } = await req.json();
    logStep("Request data received", { sessionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Stripe session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      metadata: session.metadata 
    });

    if (session.payment_status === "paid" && session.metadata?.user_id === user.id) {
      const tierIdFromMetadata = session.metadata?.tier_id;
      
      // Get tier details
      const { data: tier, error: tierError } = await supabaseClient
        .from('subscription_tiers')
        .select('*')
        .eq('id', tierIdFromMetadata || '')
        .single();

      if (tierError) {
        // Fallback to Founders Access tier if tier_id not found
        const { data: fallbackTier, error: fallbackError } = await supabaseClient
          .from('subscription_tiers')
          .select('*')
          .eq('name', 'Founders Access')
          .single();
        
        if (fallbackError) throw new Error(`Failed to fetch tier: ${fallbackError.message}`);
        Object.assign(tier, fallbackTier);
      }
      
      logStep("Tier found", { tierId: tier.id });

      // Create or update user subscription
      const subscriptionData = {
        user_id: user.id,
        tier_id: tier.id,
        status: 'active',
        payment_method: 'stripe',
        amount_paid: session.amount_total ? session.amount_total / 100 : 999, // Convert from cents
        starts_at: new Date().toISOString(),
        expires_at: null, // Lifetime access for Founders Access
        updated_at: new Date().toISOString()
      };

      // If duration_days is specified in tier and not lifetime, set expiry
      if (tier.duration_days) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + tier.duration_days);
        subscriptionData.expires_at = expiryDate.toISOString();
      }

      const { data: subscription, error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (subscriptionError) throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
      logStep("Subscription created/updated", { subscriptionId: subscription.id });

      // Handle discount code redemption if applicable
      const discountCodeId = session.metadata?.discount_code_id;
      if (discountCodeId) {
        logStep("Processing discount code redemption", { discountCodeId });
        
        // Record the redemption
        const { error: redemptionError } = await supabaseClient
          .from('discount_redemptions')
          .insert({
            user_id: user.id,
            discount_code_id: discountCodeId,
            subscription_id: subscription.id
          });

        if (redemptionError) {
          logStep("Error recording discount redemption", { error: redemptionError });
          // Don't fail the whole process for this
        } else {
          // Update discount code usage count
          const { data: currentCode } = await supabaseClient
            .from('discount_codes')
            .select('current_uses')
            .eq('id', discountCodeId)
            .single();
            
          const { error: updateError } = await supabaseClient
            .from('discount_codes')
            .update({ current_uses: (currentCode?.current_uses || 0) + 1 })
            .eq('id', discountCodeId);

          if (updateError) {
            logStep("Error updating discount code usage", { error: updateError });
          } else {
            logStep("Discount code redemption recorded successfully");
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        subscription: subscription 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      logStep("Payment not successful or user mismatch", { 
        paymentStatus: session.payment_status,
        sessionUserId: session.metadata?.user_id,
        currentUserId: user.id
      });

      return new Response(JSON.stringify({ 
        success: false, 
        error: "Payment not completed or user mismatch" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-stripe-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
