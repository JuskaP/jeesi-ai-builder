import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, Loader2, Calendar, Zap, Clock, TrendingUp, Star, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';

interface SubscriptionStatus {
  subscribed: boolean;
  plan_type: string;
  subscription_end?: string;
}

interface CreditBalance {
  credits_remaining: number;
  credits_used_this_month: number;
  plan_type: string;
}

const DAILY_CREDITS = 5;
const planMonthlyCredits: Record<string, number> = {
  free: 50,
  starter: 100,
  pro: 500,
  business: 1000,
  businessplus: 10000,  // Business+ €399/month
  enterprise: 2500,     // Enterprise €499/month
  custom: 50000,
};

// Feature comparison data
type FeatureValue = boolean | string;
const featureComparisonData: Record<string, Record<string, FeatureValue>> = {
  free: { agents: "3", monthlyCredits: "50", dailyCredits: "5", publishing: false, communitySharing: true, scheduledRuns: false, integrations: false, customDomains: false, teamCollaboration: false, apiAccess: false, whiteLabel: false, advancedAnalytics: false, ssoSupport: false, customIntegrations: false, onPremise: false, slaGuarantee: false, support: "Community" },
  starter: { agents: "Unlimited", monthlyCredits: "100", dailyCredits: "5", publishing: true, communitySharing: true, scheduledRuns: false, integrations: "Basic", customDomains: false, teamCollaboration: false, apiAccess: true, whiteLabel: false, advancedAnalytics: false, ssoSupport: false, customIntegrations: false, onPremise: false, slaGuarantee: false, support: "Priority" },
  pro: { agents: "Unlimited", monthlyCredits: "500", dailyCredits: "5", publishing: true, communitySharing: true, scheduledRuns: true, integrations: "All", customDomains: true, teamCollaboration: "Up to 5", apiAccess: true, whiteLabel: false, advancedAnalytics: false, ssoSupport: false, customIntegrations: false, onPremise: false, slaGuarantee: false, support: "Priority" },
  business: { agents: "Unlimited", monthlyCredits: "1,000", dailyCredits: "5", publishing: true, communitySharing: true, scheduledRuns: true, integrations: "All", customDomains: true, teamCollaboration: "Up to 15", apiAccess: true, whiteLabel: true, advancedAnalytics: true, ssoSupport: true, customIntegrations: false, onPremise: false, slaGuarantee: false, support: "Dedicated" },
  businessplus: { agents: "Unlimited", monthlyCredits: "10,000", dailyCredits: "5", publishing: true, communitySharing: true, scheduledRuns: true, integrations: "All", customDomains: true, teamCollaboration: "Up to 15", apiAccess: true, whiteLabel: true, advancedAnalytics: true, ssoSupport: true, customIntegrations: true, onPremise: true, slaGuarantee: true, support: "Dedicated" },
  enterprise: { agents: "Unlimited", monthlyCredits: "2,500", dailyCredits: "5", publishing: true, communitySharing: true, scheduledRuns: true, integrations: "All", customDomains: true, teamCollaboration: "Up to 15", apiAccess: true, whiteLabel: true, advancedAnalytics: true, ssoSupport: true, customIntegrations: true, onPremise: true, slaGuarantee: true, support: "24/7 Priority" },
  custom: { agents: "Unlimited", monthlyCredits: "Custom", dailyCredits: "5", publishing: true, communitySharing: true, scheduledRuns: true, integrations: "All", customDomains: true, teamCollaboration: "Unlimited", apiAccess: true, whiteLabel: true, advancedAnalytics: true, ssoSupport: true, customIntegrations: true, onPremise: true, slaGuarantee: true, support: "Dedicated Manager" }
};

const featureLabels: Record<string, string> = {
  agents: "AI Agents",
  monthlyCredits: "Monthly Credits",
  dailyCredits: "Daily Bonus Credits",
  publishing: "Publish Agents",
  communitySharing: "Community Sharing",
  scheduledRuns: "Scheduled Agent Runs",
  integrations: "Integrations",
  customDomains: "Custom Domains",
  teamCollaboration: "Team Collaboration",
  apiAccess: "API Access",
  whiteLabel: "White Label Agents",
  advancedAnalytics: "Advanced Analytics",
  ssoSupport: "SSO Support",
  customIntegrations: "Custom Integrations",
  onPremise: "On-Premise Option",
  slaGuarantee: "SLA Guarantee",
  support: "Support"
};

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
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [dailyCreditsUsed, setDailyCreditsUsed] = useState(0);

  // SEO optimization
  useSEO(SEO_CONFIG.billing);

  useEffect(() => {
    checkSubscription();
    fetchCreditBalance();
  }, []);

  const fetchCreditBalance = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data, error } = await supabase
        .from('credit_balances')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setCreditBalance(data);
    } catch (error) {
      console.error('Error fetching credit balance:', error);
    }
  };

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

  const planTiers = ['free', 'starter', 'pro', 'business', 'businessplus', 'enterprise', 'custom'];
  
  const plans = planTiers.map(tier => {
    const plan = t(`billing.plans.${tier}`, { returnObjects: true }) as any;
    return {
      ...plan,
      tier,
      isCustom: tier === 'custom',
      isFree: tier === 'free',
      popular: tier === 'pro',
      isCurrentPlan: subscription.plan_type === tier
    };
  });

  const creditPacks = t('billing.creditTopups.packs', { returnObjects: true }) as Array<{ credits: number; price: string }>;

  const handlePlanAction = (plan: any) => {
    if (plan.isCustom) {
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

      {/* Credit Balance Indicator */}
      {creditBalance && (
        <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
          {/* Daily Credits Card */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-foreground">Daily Credits</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Resets at midnight
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available today</span>
                  <span className="font-medium">{DAILY_CREDITS - dailyCreditsUsed} / {DAILY_CREDITS}</span>
                </div>
                <Progress 
                  value={((DAILY_CREDITS - dailyCreditsUsed) / DAILY_CREDITS) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Daily credits don't roll over to the next day
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Credits Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Monthly Credits</span>
                <Badge variant="secondary" className="ml-auto text-xs capitalize">
                  {creditBalance.plan_type} plan
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">
                    {creditBalance.credits_remaining} / {planMonthlyCredits[creditBalance.plan_type] || 0}
                  </span>
                </div>
                <Progress 
                  value={(creditBalance.credits_remaining / (planMonthlyCredits[creditBalance.plan_type] || 1)) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Unused credits roll over to next month
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily credits note for non-logged in users */}
      {!creditBalance && (
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground">
            {t('billing.dailyCreditsNote')} • {t('billing.creditsRollover')}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-12">
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
                  ) : plan.isCustom ? (
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

      {/* Overage Pricing Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-12 border border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {t('billing.overage.title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('billing.overage.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {t('billing.overage.pricePerCredit')}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center md:text-left">
          {t('billing.overage.note')}
        </p>
      </div>

      {/* Feature Comparison Table */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
          {t('billing.featureComparison.title')}
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Feature</TableHead>
                <TableHead className="text-center">Free</TableHead>
                <TableHead className="text-center">Starter</TableHead>
                <TableHead className="text-center relative">
                  <div className="flex flex-col items-center">
                    <Badge className="absolute -top-3 bg-primary text-primary-foreground text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                    Pro
                  </div>
                </TableHead>
                <TableHead className="text-center">Business</TableHead>
                <TableHead className="text-center">Enterprise</TableHead>
                <TableHead className="text-center">Business+</TableHead>
                <TableHead className="text-center">Custom</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(featureLabels).map((feature) => (
                <TableRow key={feature}>
                  <TableCell className="font-medium">
                    {featureLabels[feature]}
                  </TableCell>
                  {['free', 'starter', 'pro', 'business', 'enterprise', 'businessplus', 'custom'].map((plan) => {
                    const value = featureComparisonData[plan][feature];
                    return (
                      <TableCell key={plan} className={`text-center ${plan === 'pro' ? 'bg-primary/5' : ''}`}>
                        {value === true ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : value === false ? (
                          <X className="h-4 w-4 text-muted-foreground mx-auto" />
                        ) : (
                          <span className="text-sm">{String(value)}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
