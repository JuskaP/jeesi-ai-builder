import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Billing() {
  const subscribe = async (tier: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/payments/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const plans = [
    {
      name: 'Jeesi Basic',
      price: 'Ilmainen',
      period: '',
      credits: '5 krediittiä/päivä',
      maxCredits: 'Max 50 krediittiä/kk',
      description: 'Aloita ilman maksukorttia',
      features: [
        '5 ilmaista krediittiä päivässä',
        'Max 50 krediittiä kuukaudessa',
        'Agentin testaus ja kehitys',
        'Jeesi.io vesimerkki',
      ],
      limitations: [
        'Ei julkaisua tai käyttöönottoa',
        'Ei custom domaineja',
      ],
      buttonText: 'Aloita ilmaiseksi',
      buttonVariant: 'outline' as const,
      tier: 'basic',
    },
    {
      name: 'Jeesi Pro',
      price: '29,99€',
      period: '/kuukausi',
      credits: '5 krediittiä/päivä + 150/kk',
      maxCredits: 'Lisäkrediitin osto mahdollista',
      description: 'Täydet ominaisuudet ammattikäyttöön',
      popular: true,
      features: [
        '5 ilmaista krediittiä päivässä',
        '150 krediittiä kuukaudessa',
        'Usage-based Cloud + AI',
        'Krediittien siirtyminen',
        'Rajattomat jeesi.io domainit',
        'Custom domainit',
        'Poista jeesi.io badge',
        'Käyttäjäroolit ja oikeudet',
      ],
      additionalCredits: [
        { amount: 50, price: '9,99€' },
        { amount: 100, price: '14,99€' },
        { amount: 200, price: '19,99€' },
      ],
      buttonText: 'Aloita Pro',
      buttonVariant: 'default' as const,
      tier: 'pro',
    },
    {
      name: 'Jeesi Expert',
      price: '49,99€',
      period: '/250 krediittiä',
      credits: '250 krediittiä',
      maxCredits: 'Lisäkrediitin osto mahdollista',
      description: 'Edistyneet ominaisuudet ja tuki',
      features: [
        'Kaikki Pro-ominaisuudet',
        '250 krediittiä',
        'Internal publish',
        'SSO (Single Sign-On)',
        'Henkilökohtaiset projektit',
        'Opt out of data training',
        'Design-mallipohjat',
        'Prioriteettituki',
      ],
      additionalCredits: [
        { amount: 50, price: '9,99€' },
        { amount: 100, price: '14,99€' },
        { amount: 200, price: '19,99€' },
      ],
      buttonText: 'Aloita Expert',
      buttonVariant: 'default' as const,
      tier: 'expert',
    },
    {
      name: 'Jeesi Custom',
      price: 'Räätälöity',
      period: '',
      credits: 'Asiakkaan tarpeen mukaan',
      maxCredits: '',
      description: 'Yritysratkaisut ja konsultointi',
      features: [
        'Räätälöity hinnoittelu',
        'Projektien kartoitus ja konsultointi',
        'Monimutkaiset projektit',
        'Jatkuva kommunikointi ja tuki',
        'Omistettu asiakasvastaava',
        'SLA-sopimus',
        'Koulutus ja perehdytys',
        'Integraatiopalvelut',
      ],
      buttonText: 'Ota yhteyttä',
      buttonVariant: 'outline' as const,
      tier: 'custom',
      isCustom: true,
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Hinnasto</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Valitse sinulle sopiva paketti. Kaikki paketit sisältävät päivittäiset ilmaiset krediitit ja joustavat lisäostot.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                Suosituin
              </Badge>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
              <div className="pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.credits}</p>
                {plan.maxCredits && (
                  <p className="text-xs text-muted-foreground">{plan.maxCredits}</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations && (
                <ul className="space-y-2 pt-4 border-t border-border">
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="shrink-0">✗</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              )}

              {plan.additionalCredits && (
                <Accordion type="single" collapsible className="border-t border-border pt-4">
                  <AccordionItem value="credits" className="border-none">
                    <AccordionTrigger className="text-sm hover:no-underline py-2">
                      Lisäkrediitin hinnoittelu
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1">
                        {plan.additionalCredits.map((credit) => (
                          <li key={credit.amount} className="flex justify-between text-sm">
                            <span>{credit.amount} krediittiä</span>
                            <span className="font-medium">{credit.price}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <Button 
                className="w-full" 
                variant={plan.buttonVariant}
                onClick={() => {
                  if (plan.isCustom) {
                    window.location.href = 'mailto:sales@jeesi.io?subject=Custom Plan Inquiry';
                  } else {
                    subscribe(plan.tier);
                  }
                }}
              >
                {plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Tarvitsetko apua valinnassa?</h3>
        <p className="text-muted-foreground mb-4">
          Tiimimme auttaa sinua löytämään parhaan ratkaisun tarpeisiisi.
        </p>
        <Button variant="outline" onClick={() => window.location.href = 'mailto:support@jeesi.io'}>
          Ota yhteyttä
        </Button>
      </div>
    </div>
  );
}
