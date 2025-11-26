import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Zap, TrendingUp, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalAgents: number;
  activeAgents: number;
  credits: number;
  weeklyActivity: number;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAgents: 0,
    activeAgents: 0,
    credits: 1000,
    weeklyActivity: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchProfileData = async () => {
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(profileData);

        // Fetch agents
        const { data: agentsData } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (agentsData) {
          setAgents(agentsData);
          const active = agentsData.filter(a => a.status === 'active').length;
          setStats(prev => ({
            ...prev,
            totalAgents: agentsData.length,
            activeAgents: active,
            weeklyActivity: agentsData.filter(a => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(a.created_at) > weekAgo;
            }).length
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Virhe',
          description: 'Profiilin lataaminen epäonnistui',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate, toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profiili</h1>
              <p className="text-muted-foreground mt-1">
                Hallinnoi tietojasi ja agenttiasi
              </p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Kirjaudu ulos
            </Button>
          </div>

          {/* User Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle>{profile?.full_name || 'Käyttäjä'}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="hover:border-primary/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Agentit yhteensä</p>
                      <p className="text-2xl font-bold text-foreground">{stats.totalAgents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="hover:border-primary/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aktiiviset</p>
                      <p className="text-2xl font-bold text-foreground">{stats.activeAgents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="hover:border-primary/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Krediitit</p>
                      <p className="text-2xl font-bold text-foreground">{stats.credits}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="hover:border-primary/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Viikon aktiivisuus</p>
                      <p className="text-2xl font-bold text-foreground">{stats.weeklyActivity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Agents */}
          <Card>
            <CardHeader>
              <CardTitle>Viimeisimmät agentit</CardTitle>
              <CardDescription>
                Äskettäin luodut ja päivitetyt agentit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agents.length > 0 ? (
                <div className="space-y-3">
                  {agents.slice(0, 5).map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Luotu {new Date(agent.created_at).toLocaleDateString('fi-FI')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status === 'active' ? 'Aktiivinen' : 'Luonnos'}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Ei vielä agentteja</p>
                  <Button className="mt-4" onClick={() => navigate('/')}>
                    Luo ensimmäinen agentti
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
