import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Zap, TrendingUp, Bot, CreditCard, Settings, Key, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreditBalance from '@/components/CreditBalance';
import ApiKeyManager from '@/components/ApiKeyManager';

interface Agent {
  id: string;
  name: string;
  status: string;
  is_published: boolean;
  created_at: string;
}

interface CreditBalanceData {
  credits_remaining: number;
  credits_used_this_month: number;
  plan_type: string;
}

export default function Profile() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [creditBalance, setCreditBalance] = useState<CreditBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState('');

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

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
        }

        // Fetch agents
        const { data: agentsData } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (agentsData) {
          setAgents(agentsData);
        }

        // Fetch credit balance
        const { data: creditData } = await supabase
          .from('credit_balances')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (creditData) {
          setCreditBalance(creditData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: t('common.error'),
          description: t('profile.loadError'),
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate, toast, t]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev: any) => ({ ...prev, full_name: fullName }));
      toast({
        title: t('profile.settings.saved'),
        description: t('profile.settings.savedDescription'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('profile.loadError'),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPlanDisplayName = (planType: string) => {
    const plans: Record<string, string> = {
      basic: 'Basic (Free)',
      pro: 'Pro',
      expert: 'Expert',
      custom: 'Custom'
    };
    return plans[planType] || planType;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.is_published).length;
  const weeklyAgents = agents.filter(a => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(a.created_at) > weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('profile.title')}</h1>
              <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              {t('profile.signOut')}
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="gap-2">
                <User className="w-4 h-4" />
                {t('profile.tabs.overview')}
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="w-4 h-4" />
                {t('profile.tabs.billing')}
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="gap-2">
                <Key className="w-4 h-4" />
                {t('profile.tabs.apiKeys')}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                {t('profile.tabs.settings')}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* User Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{profile?.full_name || t('profile.user')}</CardTitle>
                      <CardDescription>{user?.email}</CardDescription>
                    </div>
                    {creditBalance && (
                      <Badge variant="secondary" className="text-sm">
                        {getPlanDisplayName(creditBalance.plan_type)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { icon: Bot, label: t('profile.stats.totalAgents'), value: totalAgents },
                  { icon: TrendingUp, label: t('profile.stats.active'), value: activeAgents },
                  { icon: Zap, label: t('profile.stats.credits'), value: creditBalance?.credits_remaining || 0 },
                  { icon: TrendingUp, label: t('profile.stats.weeklyActivity'), value: weeklyAgents }
                ].map(({ icon: Icon, label, value }, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:border-primary/50 transition-all duration-300">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{label}</p>
                            <p className="text-2xl font-bold text-foreground">{value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Agents */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('profile.recentAgents.title')}</CardTitle>
                    <CardDescription>{t('profile.recentAgents.description')}</CardDescription>
                  </div>
                  {agents.length > 0 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/dashboard">
                        {t('profile.recentAgents.viewAll')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
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
                        >
                          <Link 
                            to={`/agents/${agent.id}/settings`}
                            className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{agent.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {t('profile.recentAgents.created')} {new Date(agent.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant={agent.status === 'published' ? 'default' : 'secondary'}>
                              {agent.status === 'published' ? t('profile.agentStatus.active') : t('profile.agentStatus.draft')}
                            </Badge>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">{t('profile.recentAgents.noAgents')}</p>
                      <Button asChild>
                        <Link to="/">{t('profile.recentAgents.createFirst')}</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.billing.title')}</CardTitle>
                  <CardDescription>{t('profile.billing.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Plan */}
                  <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('profile.billing.currentPlan')}</p>
                        <p className="text-2xl font-bold text-foreground">
                          {creditBalance ? getPlanDisplayName(creditBalance.plan_type) : 'Basic (Free)'}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link to="/billing">{t('profile.billing.changePlan')}</Link>
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('profile.billing.creditsRemaining')}</p>
                        <p className="text-xl font-semibold text-foreground">
                          {creditBalance?.credits_remaining || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('profile.billing.creditsUsed')}</p>
                        <p className="text-xl font-semibold text-foreground">
                          {creditBalance?.credits_used_this_month || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <CreditBalance />

                  <div className="flex gap-4">
                    <Button asChild>
                      <Link to="/billing">{t('profile.billing.viewPlans')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys">
              <ApiKeyManager />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.settings.title')}</CardTitle>
                  <CardDescription>{t('profile.settings.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">{t('profile.settings.personalInfo')}</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t('profile.settings.fullName')}</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('profile.settings.email')}</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">{t('profile.settings.emailHint')}</p>
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('profile.settings.saving')}
                      </>
                    ) : (
                      t('profile.settings.saveChanges')
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
