import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-DISCOUNT-CODE] ${step}${detailsStr}`);
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

    const { code } = await req.json();
    if (!code) throw new Error("Discount code is required");

    logStep("Validating discount code", { code });

    // Get discount code details
    const { data: discountCode, error: codeError } = await supabaseClient
      .from("discount_codes")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .single();

    if (codeError || !discountCode) {
      logStep("Invalid discount code", { code, error: codeError });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Invalid discount code" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if expired
    if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
      logStep("Discount code expired", { code, expires_at: discountCode.expires_at });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Discount code has expired" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check usage limit
    if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
      logStep("Discount code usage limit reached", { code, current_uses: discountCode.current_uses, max_uses: discountCode.max_uses });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Discount code usage limit reached" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if user already used this code
    const { data: existingRedemption } = await supabaseClient
      .from("discount_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("discount_code_id", discountCode.id)
      .single();

    if (existingRedemption) {
      logStep("User already used this discount code", { code, user_id: user.id });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "You have already used this discount code" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Discount code is valid", { code, discount_percentage: discountCode.discount_percentage });

    return new Response(JSON.stringify({
      valid: true,
      discount: {
        id: discountCode.id,
        code: discountCode.code,
        discount_percentage: discountCode.discount_percentage,
        duration_days: discountCode.duration_days
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});