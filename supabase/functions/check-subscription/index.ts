import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Map Stripe product IDs to plan types
const productToPlanMap: Record<string, string> = {
  "prod_TXLM3AVt8FA4Dh": "starter",  // Starter Monthly
  "prod_TXLMoYKkoT29kh": "starter",  // Starter Annual
  "prod_TXLM7f9ywiP1Lc": "pro",      // Pro Monthly
  "prod_TXLMKKmQ8DZIem": "pro",      // Pro Annual
  "prod_TXLMmyZ035iZEh": "business", // Business Monthly
  "prod_TXLMG2WMeq2w6a": "business", // Business Annual
  "prod_TXgpAXnnAZtSz7": "enterprise", // Enterprise Monthly
  "prod_TXgpxs0o4c1IxB": "enterprise", // Enterprise Annual
  "prod_TXgpBOVAI6nl2h": "businessplus", // Business+ Monthly
  "prod_TXgppNctWGeWF1": "businessplus", // Business+ Annual
};

// Monthly credit allocations per plan (daily credits handled separately)
const planCredits: Record<string, number> = {
  free: 75,
  starter: 100,
  pro: 500,
  business: 1000,
  enterprise: 3500,
  businessplus: 10000,
};

// All plans get 5 daily credits (don't roll over)
const DAILY_CREDITS = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning free plan");
      return new Response(JSON.stringify({ subscribed: false, plan_type: 'free' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let planType = 'free';
    let subscriptionEnd: string | null = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      logStep("Active subscription found", { subscriptionId: subscription.id });
      
      // Safely parse the subscription end date
      const periodEnd = subscription.current_period_end;
      if (periodEnd && typeof periodEnd === 'number' && periodEnd > 0) {
        try {
          subscriptionEnd = new Date(periodEnd * 1000).toISOString();
          logStep("Parsed subscription end date", { periodEnd, subscriptionEnd });
        } catch (dateError) {
          logStep("Error parsing date, using null", { periodEnd, error: String(dateError) });
          subscriptionEnd = null;
        }
      }
      
      const productId = subscription.items.data[0]?.price?.product as string;
      if (productId) {
        planType = productToPlanMap[productId] || 'starter';
        logStep("Determined plan type", { productId, planType });
      } else {
        planType = 'starter';
        logStep("No product ID found, defaulting to starter");
      }
    } else {
      logStep("No active subscription found");
    }

    // Update credit balance in database
    const credits = planCredits[planType] || 50;
    logStep("Updating credit balance", { planType, credits, userId: user.id });
    
    const { error: upsertError } = await supabaseClient
      .from('credit_balances')
      .upsert({
        user_id: user.id,
        plan_type: planType,
        credits_remaining: credits,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) {
      logStep("Error updating credit balance", { error: upsertError.message });
    } else {
      logStep("Credit balance updated successfully", { planType, credits });
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan_type: planType,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});