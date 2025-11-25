import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateAgentForm() {
  const [desc, setDesc] = useState('');
  const [name, setName] = useState('');
  const [integration, setIntegration] = useState('stripe');
  const [result, setResult] = useState<string | null>(null);

  const create = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc, integrations: [integration] })
    });
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div className='mt-4 grid md:grid-cols-2 gap-6'>
      <div>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='name'>Agent name</Label>
            <Input
              id='name'
              value={name}
              onChange={e => setName(e.target.value)}
              className='mt-1'
            />
          </div>
          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={6}
              className='mt-1'
              placeholder='Kuvaile agenttia...'
            />
          </div>
          <div>
            <Label htmlFor='integration'>Primary integration</Label>
            <Select value={integration} onValueChange={setIntegration}>
              <SelectTrigger className='mt-1'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='stripe'>Stripe</SelectItem>
                <SelectItem value='supabase'>Supabase</SelectItem>
                <SelectItem value='zapier'>Zapier</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex gap-2'>
            <Button onClick={create}>Generate spec</Button>
            <Button variant='outline'>Save draft</Button>
          </div>
        </div>
      </div>
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Flow Designer (V1)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>Edit JSON spec or use generated UI.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Preview Runner</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Run quick tests of the agent here (uses test credits).
            </p>
          </CardContent>
        </Card>
        {result && (
          <Card>
            <CardContent className='p-4'>
              <pre className='text-xs overflow-auto'><code>{result}</code></pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
