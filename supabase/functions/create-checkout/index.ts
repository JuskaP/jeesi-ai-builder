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

// Price IDs for subscription plans (LIVE)
const monthlyPriceMap: Record<string, string> = {
  starter: "price_1Sbky2KDXNDCp6ElPempVyhZ",     // €19/month
  pro: "price_1SblBkKDXNDCp6ElMoXWp8ub",         // €49/month
  business: "price_1SblBnKDXNDCp6ElhXT7kx9S",    // €99/month
  businessplus: "price_1SblBrKDXNDCp6ElzsVUfTwr", // €249/month
  enterprise: "price_1SblBvKDXNDCp6ElUuuMTTwM",  // €499/month
};

const annualPriceMap: Record<string, string> = {
  starter: "price_1Sbl3oKDXNDCp6ElpehayPBE",     // €182/year
  pro: "price_1SblBlKDXNDCp6ElwSBZ8zT2",         // €470/year
  business: "price_1SblBpKDXNDCp6ElUprgLpqA",    // €950/year
  businessplus: "price_1SblBtKDXNDCp6ElOv0UxFM0", // €2,390/year
  enterprise: "price_1SblBwKDXNDCp6EllMcmITop",  // €4,790/year
};

// Credit pack price IDs (LIVE)
const creditPackPriceMap: Record<number, string> = {
  50: "price_1SblC2KDXNDCp6ElrD3ZUrcj",     // €12.90
  100: "price_1SblC3KDXNDCp6ElOBdqoSAj",    // €19.90
  250: "price_1SblC4KDXNDCp6Eld7aCG9pr",    // €24.90
  500: "price_1SblC5KDXNDCp6Elap7CmEil",    // €49.90
  1000: "price_1SblC7KDXNDCp6ElKUh31n6e",   // €84.90
};

// Overage credit price ID (€0.10 per credit) - LIVE
const OVERAGE_PRICE_ID = "price_1SblC9KDXNDCp6ElniT55Lzk";

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
        throw new Error(`Invalid tier: ${tier}. Valid tiers are: starter, pro, business, businessplus, enterprise`);
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
