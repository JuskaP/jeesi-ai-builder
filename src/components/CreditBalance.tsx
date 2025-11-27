import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    basic: "Basic",
    pro: "Pro",
    expert: "Expert",
    custom: "Custom"
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jäljellä olevat krediitit</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.credits_remaining}</div>
            <p className="text-xs text-muted-foreground">Käytettävissä nyt</p>
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
            <CardTitle className="text-sm font-medium">Käytetty tässä kuussa</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.credits_used_this_month}</div>
            <p className="text-xs text-muted-foreground">Krediittiä käytetty</p>
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
            <CardTitle className="text-sm font-medium">Tilaustaso</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planLabels[balance.plan_type]}</div>
            <p className="text-xs text-muted-foreground">Nykyinen suunnitelma</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
