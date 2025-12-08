import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface CreditBalance {
  credits_remaining: number;
  credits_used_this_month: number;
  plan_type: string;
}

export default function CreditBalance() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
    
    // Subscribe to real-time credit balance updates
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('credit-balance-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'credit_balances',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Credit balance updated:', payload);
            if (payload.new) {
              const newBalance = payload.new as CreditBalance;
              setBalance({
                credits_remaining: newBalance.credits_remaining,
                credits_used_this_month: newBalance.credits_used_this_month,
                plan_type: newBalance.plan_type
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscription();
    
    return () => {
      cleanup.then(unsubscribe => unsubscribe?.());
    };
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("credit_balances")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If no balance exists, create one
        if (error.code === "PGRST116") {
          const { data: newBalance } = await supabase
            .from("credit_balances")
            .insert({
              user_id: user.id,
              credits_remaining: 5,
              credits_used_this_month: 0,
              plan_type: "basic"
            })
            .select()
            .single();
          
          setBalance(newBalance);
        }
      } else {
        setBalance(data);
      }
    } catch (error) {
      console.error("Error fetching credit balance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-muted h-32 rounded-lg" />;
  }

  if (!balance) return null;

  const planLabels: Record<string, string> = {
    free: "Free",
    basic: "Free",
    starter: "Starter",
    pro: "Pro",
    business: "Business",
    businessplus: "Business+",
    enterprise: "Enterprise",
    expert: "Expert",
    custom: "Custom"
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        key={`remaining-${balance.credits_remaining}`}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div 
              className="text-2xl font-bold"
              key={balance.credits_remaining}
              initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
              animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
              transition={{ duration: 0.3 }}
            >
              {balance.credits_remaining}
            </motion.div>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div 
              className="text-2xl font-bold"
              key={balance.credits_used_this_month}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {balance.credits_used_this_month}
            </motion.div>
            <p className="text-xs text-muted-foreground">Credits used</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Tier</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planLabels[balance.plan_type]}</div>
            <p className="text-xs text-muted-foreground">Current plan</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
