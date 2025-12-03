import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CreateWorkspaceDialog from '@/components/CreateWorkspaceDialog';
import { Plus, Users, Globe, Lock } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  shared_credits: number;
  owner_id: string;
  member_count: number;
  role: string;
}

export default function Workspaces() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    
    if (user) {
      await loadWorkspaces(user.id);
    } else {
      setIsLoading(false);
    }
  };

  const loadWorkspaces = async (userId: string) => {
    setIsLoading(true);
    try {
      // Get workspaces where user is a member
      const { data: memberships, error } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspace:workspaces(
            id,
            name,
            description,
            is_public,
            shared_credits,
            owner_id
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      // Transform and count members for each workspace
      const workspacesWithCounts = await Promise.all(
        (memberships || []).map(async (m: any) => {
          const { count } = await supabase
            .from('workspace_members')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', m.workspace.id);

          return {
            ...m.workspace,
            role: m.role,
            member_count: count || 0,
          };
        })
      );

      setWorkspaces(workspacesWithCounts);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = () => {
    if (!isAuthenticated) {
      toast({
        title: t('workspaces.loginRequired'),
        description: t('workspaces.loginDescription'),
      });
      navigate('/auth');
      return;
    }
    setCreateDialogOpen(true);
  };

  const handleWorkspaceCreated = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadWorkspaces(user.id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">{t('workspaces.title')}</h2>
        <p className="text-muted-foreground">{t('workspaces.description')}</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-9 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Card 
              key={workspace.id}
              className="group hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{workspace.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {workspace.is_public ? (
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Badge variant={workspace.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                      {t(`workspaces.roles.${workspace.role}`)}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {workspace.description || t('workspaces.noDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {t('workspaces.members', { count: workspace.member_count })}
                  </div>
                  <span>•</span>
                  <span>{t('workspaces.credits', { count: workspace.shared_credits })}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to={`/workspaces/${workspace.id}`}>{t('workspaces.viewDetails')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Create new workspace card */}
          <Card 
            className="flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group min-h-[200px]"
            onClick={handleCreateWorkspace}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t('workspaces.create')}</h3>
              <p className="text-sm text-muted-foreground">{t('workspaces.startCollaboration')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!isAuthenticated && workspaces.length === 0 && !isLoading && (
        <div className="mt-8 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">{t('workspaces.collaborationTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-3">{t('workspaces.collaborationText')}</p>
              <Button asChild>
                <Link to="/auth">{t('nav.signIn')}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <CreateWorkspaceDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  );
}
