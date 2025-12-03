import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, Loader2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [isAnnual, setIsAnnual] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({ 
    subscribed: false, 
    plan_type: 'free' 
  });

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      setCheckingSubscription(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setSubscription({ subscribed: false, plan_type: 'free' });
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
        body: { tier, annual: isAnnual }
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

  const buyCredits = async (credits: number) => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase credits.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { creditPack: credits }
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

  const planTiers = ['free', 'starter', 'pro', 'business', 'enterprise'];
  
  const plans = planTiers.map(tier => {
    const plan = t(`billing.plans.${tier}`, { returnObjects: true }) as any;
    return {
      ...plan,
      tier,
      isEnterprise: tier === 'enterprise',
      isFree: tier === 'free',
      popular: tier === 'pro',
      isCurrentPlan: subscription.plan_type === tier
    };
  });

  const creditPacks = t('billing.creditTopups.packs', { returnObjects: true }) as Array<{ credits: number; price: string }>;

  const handlePlanAction = (plan: any) => {
    if (plan.isEnterprise) {
      window.open('https://cal.com/jeesi/enterprise', '_blank');
    } else if (plan.isFree) {
      // Free plan - do nothing
    } else if (!plan.isCurrentPlan) {
      subscribe(plan.tier);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('billing.title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('billing.subtitle')}
        </p>
        
        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Label htmlFor="billing-toggle" className={!isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
            {t('billing.monthly')}
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label htmlFor="billing-toggle" className={isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
            {t('billing.annual')}
          </Label>
          {isAnnual && (
            <Badge variant="secondary" className="ml-2">
              {t('billing.annualSave')}
            </Badge>
          )}
        </div>

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

      {/* Daily credits note */}
      <div className="text-center mb-8">
        <p className="text-sm text-muted-foreground">
          {t('billing.dailyCreditsNote')} • {t('billing.creditsRollover')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
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
            
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[32px] text-sm">{plan.description}</CardDescription>
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">
                      {isAnnual ? plan.annualPrice : plan.price}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-1.5">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2 text-xs">
                      <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation: string) => (
                    <li key={limitation} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <X className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  size="sm"
                  disabled={loading || plan.isCurrentPlan}
                  onClick={() => handlePlanAction(plan)}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : plan.isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.isEnterprise ? (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      {plan.cta}
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Credit Top-ups Section */}
      <div className="bg-muted/50 rounded-lg p-6 mb-12">
        <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
          {t('billing.creditTopups.title')}
        </h3>
        <p className="text-muted-foreground mb-6 text-center">
          {t('billing.creditTopups.description')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {creditPacks.map((pack) => (
            <Card key={pack.credits} className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-foreground mb-1">{pack.credits}</div>
                <div className="text-sm text-muted-foreground mb-3">credits</div>
                <div className="text-lg font-semibold text-primary mb-3">{pack.price}</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => buyCredits(pack.credits)}
                  disabled={loading}
                >
                  {t('billing.creditTopups.buy')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
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
