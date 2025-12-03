import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // For now, store in localStorage as a simple solution
      // Can be upgraded to Supabase table later
      const subscribers = JSON.parse(localStorage.getItem("newsletter-subscribers") || "[]");
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem("newsletter-subscribers", JSON.stringify(subscribers));
      }

      toast({
        title: "Successfully subscribed!",
        description: "You'll receive our latest insights and updates.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10 w-fit">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Stay Ahead of the AI Curve</CardTitle>
        <CardDescription className="text-base">
          Get weekly insights on AI agents, automation strategies, and platform updates delivered to your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-3">
          No spam, ever. Unsubscribe anytime.
        </p>
      </CardContent>
    </Card>
  );
}
