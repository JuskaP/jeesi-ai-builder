import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Credit pack mapping (credits by pack price) - LIVE
const creditPackCredits: Record<string, number> = {
  "price_1SblC2KDXNDCp6ElrD3ZUrcj": 50,    // €12.90
  "price_1SblC3KDXNDCp6ElOBdqoSAj": 100,   // €19.90
  "price_1SblC4KDXNDCp6Eld7aCG9pr": 250,   // €24.90
  "price_1SblC5KDXNDCp6Elap7CmEil": 500,   // €49.90
  "price_1SblC7KDXNDCp6ElKUh31n6e": 1000,  // €84.90
};

// Overage price ID (€0.10 per credit) - LIVE
const OVERAGE_PRICE_ID = "price_1SblC9KDXNDCp6ElniT55Lzk";

// Subscription plan credits (monthly credits added on subscription) - LIVE
const subscriptionCredits: Record<string, number> = {
  "price_1Sbky2KDXNDCp6ElPempVyhZ": 100,   // starter monthly €19
  "price_1Sbl3oKDXNDCp6ElpehayPBE": 100,   // starter annual €182
  "price_1SblBkKDXNDCp6ElMoXWp8ub": 500,   // pro monthly €49
  "price_1SblBlKDXNDCp6ElwSBZ8zT2": 500,   // pro annual €470
  "price_1SblBnKDXNDCp6ElhXT7kx9S": 1000,  // business monthly €99
  "price_1SblBpKDXNDCp6ElUprgLpqA": 1000,  // business annual €950
  "price_1SblBrKDXNDCp6ElzsVUfTwr": 2500,  // businessplus monthly €249
  "price_1SblBtKDXNDCp6ElOv0UxFM0": 2500,  // businessplus annual €2,390
  "price_1SblBvKDXNDCp6ElUuuMTTwM": 10000, // enterprise monthly €499
  "price_1SblBwKDXNDCp6EllMcmITop": 10000, // enterprise annual €4,790
};

const getPlanTypeFromPrice = (priceId: string): string => {
  if (["price_1Sbky2KDXNDCp6ElPempVyhZ", "price_1Sbl3oKDXNDCp6ElpehayPBE"].includes(priceId)) {
    return "starter";
  }
  if (["price_1SblBkKDXNDCp6ElMoXWp8ub", "price_1SblBlKDXNDCp6ElwSBZ8zT2"].includes(priceId)) {
    return "pro";
  }
  if (["price_1SblBnKDXNDCp6ElhXT7kx9S", "price_1SblBpKDXNDCp6ElUprgLpqA"].includes(priceId)) {
    return "business";
  }
  // Business+ (€249, 2,500 credits)
  if (["price_1SblBrKDXNDCp6ElzsVUfTwr", "price_1SblBtKDXNDCp6ElOv0UxFM0"].includes(priceId)) {
    return "businessplus";
  }
  // Enterprise (€499, 10,000 credits)
  if (["price_1SblBvKDXNDCp6ElUuuMTTwM", "price_1SblBwKDXNDCp6EllMcmITop"].includes(priceId)) {
    return "enterprise";
  }
  return "free";
};

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    logStep("ERROR: Missing signature or webhook secret");
    return new Response(JSON.stringify({ error: "Missing signature or webhook secret" }), { status: 400 });
  }

  try {
    const body = await req.text();
    // Use constructEventAsync for Deno compatibility
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    logStep("Webhook event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id, mode: session.mode });

        const userId = session.metadata?.user_id;
        if (!userId) {
          logStep("No user_id in metadata, skipping");
          break;
        }

        // Handle one-time credit pack purchase
        if (session.mode === "payment") {
          const creditPackAmount = session.metadata?.credit_pack;
          if (creditPackAmount) {
            const creditsToAdd = parseInt(creditPackAmount, 10);
            logStep("Adding credits for credit pack", { userId, creditsToAdd });

            // Get current balance
            const { data: currentBalance } = await supabaseClient
              .from("credit_balances")
              .select("credits_remaining")
              .eq("user_id", userId)
              .single();

            const newBalance = (currentBalance?.credits_remaining || 0) + creditsToAdd;

            // Upsert credit balance
            const { error } = await supabaseClient
              .from("credit_balances")
              .upsert({
                user_id: userId,
                credits_remaining: newBalance,
                updated_at: new Date().toISOString(),
              }, { onConflict: "user_id" });

            if (error) {
              logStep("Error adding credits", { error: error.message });
            } else {
              logStep("Credits added successfully", { userId, newBalance });
            }
          }
        }

        // Handle subscription creation
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price.id;
          const planType = getPlanTypeFromPrice(priceId);
          const monthlyCredits = subscriptionCredits[priceId] || 100;

          logStep("Processing subscription", { userId, planType, monthlyCredits, priceId });

          // Get current balance
          const { data: currentBalance } = await supabaseClient
            .from("credit_balances")
            .select("credits_remaining")
            .eq("user_id", userId)
            .single();

          const newBalance = (currentBalance?.credits_remaining || 0) + monthlyCredits;

          // Update credit balance with plan type
          const { error } = await supabaseClient
            .from("credit_balances")
            .upsert({
              user_id: userId,
              credits_remaining: newBalance,
              plan_type: planType,
              credits_used_this_month: 0,
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

          if (error) {
            logStep("Error updating subscription credits", { error: error.message });
          } else {
            logStep("Subscription credits added", { userId, planType, newBalance });
          }
        }
        break;
      }

      case "invoice.paid": {
        // Handle recurring subscription payments
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.billing_reason === "subscription_cycle") {
          const customerId = invoice.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          const email = customer.email;

          if (!email) {
            logStep("No email on customer, skipping renewal");
            break;
          }

          // Find user by email
          const { data: userData } = await supabaseClient.auth.admin.listUsers();
          const user = userData?.users.find(u => u.email === email);

          if (!user) {
            logStep("User not found for email", { email });
            break;
          }

          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const priceId = subscription.items.data[0]?.price.id;
          const monthlyCredits = subscriptionCredits[priceId] || 100;

          logStep("Processing subscription renewal", { userId: user.id, monthlyCredits });

          // Reset monthly usage and add credits
          const { error } = await supabaseClient
            .from("credit_balances")
            .update({
              credits_remaining: monthlyCredits,
              credits_used_this_month: 0,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

          if (error) {
            logStep("Error processing renewal", { error: error.message });
          } else {
            logStep("Renewal processed", { userId: user.id, monthlyCredits });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = customer.email;

        if (!email) break;

        const { data: userData } = await supabaseClient.auth.admin.listUsers();
        const user = userData?.users.find(u => u.email === email);

        if (user) {
          // Downgrade to free plan
          await supabaseClient
            .from("credit_balances")
            .update({
              plan_type: "free",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

          logStep("Subscription cancelled, downgraded to free", { userId: user.id });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Webhook error", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
});