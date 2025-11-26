import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    setAgents([
      { id: 'a1', name: 'Support Bot', status: 'deployed' },
      { id: 'a2', name: 'Landing Page Generator', status: 'draft' }
    ]);
  }, []);

  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <h2 className='text-2xl font-semibold text-foreground'>Omat Agentit</h2>
      <p className='mt-2 text-sm text-muted-foreground'>Agentit ja niiden tila.</p>
      <div className='mt-6 space-y-4'>
        {agents.map(a => (
          <Card key={a.id}>
            <CardContent className='flex items-center justify-between p-4'>
              <div>
                <h3 className='font-medium text-foreground'>{a.name}</h3>
                <p className='text-sm text-muted-foreground'>Status: {a.status}</p>
              </div>
              <div className='flex gap-2'>
                <Button variant="outline" size="sm">Edit</Button>
                <Button size="sm">Run</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <div className='pt-4'>
          <Button asChild>
            <Link to='/community'>Luo uusi agentti</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
