import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Billing() {
  const [plan, setPlan] = useState('free');

  const subscribe = async (tier: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/payments/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <h2 className='text-2xl font-semibold text-foreground'>Billing</h2>
      <p className='mt-2 text-sm text-muted-foreground'>Hallinnoi tilaustasi ja maksuja.</p>
      <div className='mt-6 grid md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>200 test credits / month</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => subscribe('free')} variant='outline'>
              Select
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>Unlimited agent creation • Monthly</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => subscribe('pro')}>Subscribe</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
