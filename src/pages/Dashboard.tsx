import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAgents();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(t('agentSettings.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className='p-8 max-w-7xl mx-auto min-h-[calc(100vh-200px)] flex items-center justify-center'>
        <div className='text-center space-y-6'>
          <div className='w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center'>
            <svg className='w-12 h-12 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <div>
            <h2 className='text-2xl font-semibold text-foreground mb-2'>{t('dashboard.empty')}</h2>
            <p className='text-muted-foreground max-w-md mx-auto'>
              {t('landing.hero.subtitle')}
            </p>
          </div>
          <Button asChild size='lg'>
            <Link to='/community'>{t('dashboard.empty')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-3xl font-bold text-foreground'>{t('dashboard.title')}</h2>
          <p className='mt-2 text-muted-foreground'>{t('dashboard.title')}</p>
        </div>
        <Button asChild>
          <Link to='/community'>{t('common.add')}</Link>
        </Button>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        {agents.map(agent => (
          <Card 
            key={agent.id}
            className='group cursor-pointer hover:border-primary/50 transition-all duration-300'
          >
            <CardHeader>
              <div className='flex items-start justify-between'>
                <CardTitle className='text-xl'>{agent.name}</CardTitle>
                <Badge 
                  variant={agent.status === 'deployed' ? 'default' : 'secondary'}
                  className='text-xs'
                >
                  {agent.status === 'deployed' ? t('dashboard.status.completed') : t('dashboard.status.inProgress')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2'>
                <Button variant='outline' size='sm' className='flex-1' asChild>
                  <Link to={`/agents/${agent.id}/settings`}>{t('dashboard.actions.edit')}</Link>
                </Button>
                <Button size='sm' className='flex-1' disabled>
                  {t('dashboard.actions.view')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
