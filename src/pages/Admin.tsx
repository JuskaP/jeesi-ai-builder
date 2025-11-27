import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Bot, CreditCard, TrendingUp, Activity, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface AdminStats {
  total_users: number;
  total_agents: number;
  agents_this_week: number;
  agents_this_month: number;
  active_users: number;
  total_credits_used: number;
  credits_used_this_week: number;
  pro_subscribers: number;
  expert_subscribers: number;
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface RecentAgent {
  id: string;
  name: string;
  purpose: string;
  created_at: string;
  user_email: string;
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentAgents, setRecentAgents] = useState<RecentAgent[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has admin role
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (roleError) throw roleError;

      if (!roles || roles.length === 0) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error('Failed to verify admin access');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Fetch admin statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_admin_stats');

      if (statsError) throw statsError;
      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Fetch recent users (last 10)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (usersError) throw usersError;
      setRecentUsers(usersData || []);

      // Fetch recent agents with user email
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          purpose,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (agentsError) throw agentsError;

      // Get user emails for agents
      if (agentsData) {
        const agentsWithEmails = await Promise.all(
          agentsData.map(async (agent) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', agent.user_id)
              .single();

            return {
              ...agent,
              user_email: profile?.email || 'Unknown'
            };
          })
        );
        setRecentAgents(agentsWithEmails);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Platform monitoring and analytics</p>
          </div>
          <Badge variant="default" className="text-sm">
            Alpha Testing
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.active_users || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Agents
              </CardTitle>
              <Bot className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_agents || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{stats?.agents_this_week || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credits Used
              </CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_credits_used || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.credits_used_this_week || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Subscribers
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.pro_subscribers || 0) + (stats?.expert_subscribers || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.pro_subscribers || 0} Pro · {stats?.expert_subscribers || 0} Expert
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Agent Creation Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="text-lg font-semibold">{stats?.agents_this_week || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="text-lg font-semibold">{stats?.agents_this_month || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">All Time</span>
                <span className="text-lg font-semibold">{stats?.total_agents || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{user.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Recently Created Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.purpose}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created by: {agent.user_email}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
