import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Price IDs for subscription plans
const monthlyPriceMap: Record<string, string> = {
  starter: "price_1SaGfcGx4tvYlwhYuxu4weEo",
  pro: "price_1SaGflGx4tvYlwhYcZj1MSf0",
  business: "price_1SaGfoGx4tvYlwhYiIfhKBSc",
  enterprise: "price_1SabRQGx4tvYlwhYnBT4CEUH",
  businessplus: "price_1SabRSGx4tvYlwhYxcUD0VlX",
};

const annualPriceMap: Record<string, string> = {
  starter: "price_1SaGfkGx4tvYlwhYpSWO1FDR",
  pro: "price_1SaGfmGx4tvYlwhYngNzJNmS",
  business: "price_1SaGfpGx4tvYlwhY01HLAcPB",
  enterprise: "price_1SabRRGx4tvYlwhYERemhD0U",
  businessplus: "price_1SabRTGx4tvYlwhYpQQdVdSy",
};

// Credit pack price IDs
const creditPackPriceMap: Record<number, string> = {
  50: "price_1Sabv2Gx4tvYlwhY12wIFZxW",    // €12.90
  100: "price_1SaGfqGx4tvYlwhYH4YSgRyv",
  250: "price_1SaKQOGx4tvYlwhYkEDHcAPJ",   // €24.90
  500: "price_1SaGfrGx4tvYlwhYUs592ySr",
  1000: "price_1SaGfsGx4tvYlwhYnVnc6bKT",
};

// Overage credit price ID (€0.10 per credit)
const OVERAGE_PRICE_ID = "price_1Sabv4Gx4tvYlwhYsTuneLfr";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const { tier, annual, creditPack } = body;
    logStep("Received request", { tier, annual, creditPack });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found");
    }

    let priceId: string;
    let mode: "subscription" | "payment";

    // Handle credit pack purchase
    if (creditPack) {
      priceId = creditPackPriceMap[creditPack];
      if (!priceId) {
        throw new Error(`Invalid credit pack: ${creditPack}. Valid packs are: 50, 100, 250, 500, 1000`);
      }
      mode = "payment";
      logStep("Credit pack purchase", { creditPack, priceId });
    } else {
      // Handle subscription
      const priceMap = annual ? annualPriceMap : monthlyPriceMap;
      priceId = priceMap[tier];
      if (!priceId) {
        throw new Error(`Invalid tier: ${tier}. Valid tiers are: starter, pro, business`);
      }
      mode = "subscription";
      logStep("Subscription checkout", { tier, annual, priceId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: `${req.headers.get("origin")}/billing?success=true`,
      cancel_url: `${req.headers.get("origin")}/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        ...(creditPack && { credit_pack: creditPack.toString() }),
      },
    });
    logStep("Checkout session created", { sessionId: session.id, mode });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
