import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Credit pack mapping (credits by pack price)
const creditPackCredits: Record<string, number> = {
  "price_1SaGfqGx4tvYlwhYH4YSgRyv": 100,
  "price_1SaGfrGx4tvYlwhYF33QRCsi": 250,
  "price_1SaGfrGx4tvYlwhYUs592ySr": 500,
  "price_1SaGfsGx4tvYlwhYnVnc6bKT": 1000,
};

// Subscription plan credits (monthly credits added on subscription)
const subscriptionCredits: Record<string, number> = {
  "price_1SaGfcGx4tvYlwhYuxu4weEo": 100,  // starter monthly
  "price_1SaGfkGx4tvYlwhYpSWO1FDR": 100,  // starter annual
  "price_1SaGflGx4tvYlwhYcZj1MSf0": 500,  // pro monthly
  "price_1SaGfmGx4tvYlwhYngNzJNmS": 500,  // pro annual
  "price_1SaGfoGx4tvYlwhYiIfhKBSc": 1000,  // business monthly
  "price_1SaGfpGx4tvYlwhY01HLAcPB": 1000,  // business annual
};

const getPlanTypeFromPrice = (priceId: string): string => {
  if (priceId.includes("starter") || ["price_1SaGfcGx4tvYlwhYuxu4weEo", "price_1SaGfkGx4tvYlwhYpSWO1FDR"].includes(priceId)) {
    return "starter";
  }
  if (priceId.includes("pro") || ["price_1SaGflGx4tvYlwhYcZj1MSf0", "price_1SaGfmGx4tvYlwhYngNzJNmS"].includes(priceId)) {
    return "pro";
  }
  if (priceId.includes("business") || ["price_1SaGfoGx4tvYlwhYiIfhKBSc", "price_1SaGfpGx4tvYlwhY01HLAcPB"].includes(priceId)) {
    return "business";
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