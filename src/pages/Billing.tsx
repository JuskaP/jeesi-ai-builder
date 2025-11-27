import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Billing() {
  const { t } = useTranslation();

  const subscribe = async (tier: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/payments/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const planTiers = ['basic', 'pro', 'expert', 'custom'];
  
  const plans = planTiers.map(tier => {
    const plan = t(`billing.plans.${tier}`, { returnObjects: true }) as any;
    return {
      ...plan,
      tier,
      isCustom: tier === 'custom',
      popular: tier === 'pro'
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('billing.title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('billing.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan: any) => (
          <Card 
            key={plan.name} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''}`}
          >
            {plan.popular && (
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
                onClick={() => {
                  if (plan.isCustom) {
                    window.location.href = 'mailto:sales@jeesi.ai?subject=Custom Plan Inquiry';
                  } else {
                    subscribe(plan.tier);
                  }
                }}
              >
                {plan.cta || t('common.getStarted')}
              </Button>
            </CardContent>
          </Card>
        ))}
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
