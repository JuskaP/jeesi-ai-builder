import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // In production, check auth status
    // For now, showing public view
    setIsAuthenticated(false);
    setWorkspaces([
      { id: 'w1', name: 'Esimerkki Työtila', members: 3, credits: 200, isPublic: true }
    ]);
  }, []);

  const handleCreateWorkspace = () => {
    if (!isAuthenticated) {
      toast({
        title: "Kirjautuminen vaaditaan",
        description: "Sinun täytyy kirjautua sisään tai luoda tili luodaksesi työtilan.",
      });
      navigate('/auth');
      return;
    }
    // Create workspace logic
  };

  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-foreground mb-2'>Työtilat</h2>
        <p className='text-muted-foreground'>
          Hallinnoi työtiloja ja tiimien käyttöoikeuksia. Luo yhteistyöhön perustuva ympäristö agenttien kehittämiseen.
        </p>
      </div>

      <div className='mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {workspaces.map(workspace => (
          <Card 
            key={workspace.id}
            className='group hover:border-primary/50 transition-all duration-300 hover:-translate-y-1'
          >
            <CardHeader>
              <div className='flex items-start justify-between'>
                <CardTitle className='text-xl'>{workspace.name}</CardTitle>
                {workspace.isPublic && (
                  <Badge variant='secondary' className='text-xs'>
                    Julkinen
                  </Badge>
                )}
              </div>
              <CardDescription>
                {workspace.members} jäsentä • {workspace.credits} krediittiä
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Button variant='outline' size='sm' className='w-full'>
                  Näytä tiedot
                </Button>
                {!isAuthenticated && (
                  <p className='text-xs text-muted-foreground text-center'>
                    Kirjaudu sisään hallinnoidaksesi
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card 
          className='flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group'
          onClick={handleCreateWorkspace}
        >
          <CardContent className='p-8 text-center'>
            <div className='w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300'>
              <svg className='w-8 h-8 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
            </div>
            <h3 className='font-semibold text-foreground mb-2'>Luo uusi työtila</h3>
            <p className='text-sm text-muted-foreground'>
              Aloita yhteistyö tiimisi kanssa
            </p>
          </CardContent>
        </Card>
      </div>

      {!isAuthenticated && (
        <div className='mt-8 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50'>
          <div className='flex items-start gap-4'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
              <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div className='flex-1'>
              <h3 className='font-semibold text-foreground mb-1'>Aloita yhteistyö</h3>
              <p className='text-sm text-muted-foreground mb-3'>
                Kirjaudu sisään tai luo tili luodaksesi oman työtilan ja kutsuaksesi tiimisi jäseniä.
              </p>
              <Button asChild>
                <Link to='/auth'>Kirjaudu tai luo tili</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
