import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CreateAgentForm() {
  const [desc, setDesc] = useState('');
  const [name, setName] = useState('');
  const [integration, setIntegration] = useState('stripe');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const create = async () => {
    if (!name || !desc) {
      toast({
        title: "Missing fields",
        description: "Please provide both name and description.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create an agent.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-agent', {
        body: {
          userId: session.user.id,
          config: {
            name,
            purpose: integration,
            description: desc,
            system_prompt: `You are ${name}, an AI assistant. ${desc}`
          }
        }
      });

      if (error) throw error;
      setResult(JSON.stringify(data, null, 2));
      toast({
        title: "Agent created!",
        description: `${name} has been created successfully.`
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            <Button onClick={create} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Creating...' : 'Create Agent'}
            </Button>
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
