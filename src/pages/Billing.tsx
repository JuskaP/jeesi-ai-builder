import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  plan_type: string;
  subscription_end?: string;
}

export default function Billing() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({ 
    subscribed: false, 
    plan_type: 'basic' 
  });

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      setCheckingSubscription(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setSubscription({ subscribed: false, plan_type: 'basic' });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const subscribe = async (tier: string) => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe to a plan.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });
      
      if (error) throw error;
      if (data.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const manageSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const planTiers = ['basic', 'pro', 'expert', 'custom'];
  
  const plans = planTiers.map(tier => {
    const plan = t(`billing.plans.${tier}`, { returnObjects: true }) as any;
    return {
      ...plan,
      tier,
      isCustom: tier === 'custom',
      popular: tier === 'pro',
      isCurrentPlan: subscription.plan_type === tier
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('billing.title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('billing.subtitle')}
        </p>
        {subscription.subscribed && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <Badge variant="default" className="text-sm">
              Current Plan: {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)}
            </Badge>
            <Button variant="outline" size="sm" onClick={manageSubscription} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage Subscription"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {checkingSubscription ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          plans.map((plan: any) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''} ${plan.isCurrentPlan ? 'border-2 border-primary' : ''}`}
            >
              {plan.isCurrentPlan && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  <Check className="h-3 w-3 mr-1" />
                  Your Plan
                </Badge>
              )}
              {plan.popular && !plan.isCurrentPlan && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t('billing.mostPopular')}
                </Badge>
              )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
              <div className="pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-2">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={plan.popular ? 'default' : 'outline'}
                disabled={loading || plan.isCurrentPlan || (plan.tier === 'basic' && !plan.isCurrentPlan)}
                onClick={() => {
                  if (plan.isCustom) {
                    window.location.href = 'mailto:sales@jeesi.ai?subject=Custom Plan Inquiry';
                  } else if (!plan.isCurrentPlan && plan.tier !== 'basic') {
                    subscribe(plan.tier);
                  }
                }}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : plan.isCurrentPlan ? (
                  'Current Plan'
                ) : (
                  plan.cta || t('common.getStarted')
                )}
              </Button>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">{t('billing.needHelp')}</h3>
        <p className="text-muted-foreground mb-4">
          {t('billing.helpDescription')}
        </p>
        <Button variant="outline" onClick={() => window.location.href = 'mailto:support@jeesi.ai'}>
          {t('billing.contact')}
        </Button>
      </div>
    </div>
  );
}
