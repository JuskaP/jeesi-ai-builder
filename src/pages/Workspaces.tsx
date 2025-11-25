import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  useEffect(() => {
    setWorkspaces([{ id: 'w1', name: 'Default Workspace', members: 3, credits: 200 }]);
  }, []);

  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <h2 className='text-2xl font-semibold text-foreground'>Workspaces</h2>
      <p className='mt-2 text-sm text-muted-foreground'>
        Hallinnoi työtiloja ja tiimien käyttöoikeuksia.
      </p>
      <div className='mt-6 grid md:grid-cols-2 gap-6'>
        {workspaces.map(w => (
          <Card key={w.id}>
            <CardHeader>
              <CardTitle>{w.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Members: {w.members} • Credits: {w.credits}
              </p>
              <div className='mt-3 flex gap-2'>
                <Button variant='outline' size='sm'>Manage</Button>
                <Button variant='destructive' size='sm'>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className='flex items-center justify-center'>
          <CardContent className='p-6'>
            <Button>Create Workspace</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
