import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import InviteMemberDialog from '@/components/InviteMemberDialog';
import { ArrowLeft, Users, Bot, Settings, UserPlus, Trash2, Mail, Clock } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_public: boolean;
  shared_credits: number;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile: {
    full_name: string | null;
    email: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface Agent {
  id: string;
  name: string;
  purpose: string;
  status: string;
}

export default function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Load workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .single();

      if (workspaceError) throw workspaceError;
      setWorkspace(workspaceData);

      // Load members with profiles
      const { data: membersData } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profile:profiles(full_name, email)
        `)
        .eq('workspace_id', id);

      setMembers(membersData as any || []);

      // Find current user's role
      const currentMember = membersData?.find(m => m.user_id === user?.id);
      setUserRole(currentMember?.role || null);

      // Load invitations if admin
      if (currentMember?.role === 'owner' || currentMember?.role === 'admin') {
        const { data: invitationsData } = await supabase
          .from('workspace_invitations')
          .select('*')
          .eq('workspace_id', id)
          .eq('status', 'pending');

        setInvitations(invitationsData || []);
      }

      // Load workspace agents
      const { data: agentsData } = await supabase
        .from('agents')
        .select('id, name, purpose, status')
        .eq('workspace_id', id);

      setAgents(agentsData || []);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
      navigate('/workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === workspace?.owner_id) {
      toast({
        title: t('common.error'),
        description: t('workspaces.cannotRemoveOwner'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({ title: t('workspaces.memberRemoved') });
      loadData();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({ title: t('workspaces.invitationCanceled') });
      loadData();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const isAdmin = userRole === 'owner' || userRole === 'admin';

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/workspaces')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('workspaces.backToWorkspaces')}
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-foreground">{workspace.name}</h1>
          {workspace.is_public && (
            <Badge variant="secondary">{t('workspaces.public')}</Badge>
          )}
        </div>
        {workspace.description && (
          <p className="text-muted-foreground">{workspace.description}</p>
        )}
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            {t('workspaces.membersTab')}
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            <Bot className="w-4 h-4" />
            {t('workspaces.agentsTab')}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              {t('workspaces.settingsTab')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('workspaces.teamMembers')}</h2>
            {isAdmin && (
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                {t('workspaces.inviteMember')}
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {(member.profile?.full_name || member.profile?.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.profile?.full_name || t('workspaces.unnamed')}</p>
                      <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                      {t(`workspaces.roles.${member.role}`)}
                    </Badge>
                    {isAdmin && member.user_id !== workspace.owner_id && member.user_id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isAdmin && invitations.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mt-8">{t('workspaces.pendingInvitations')}</h3>
              <div className="grid gap-4">
                {invitations.map((invitation) => (
                  <Card key={invitation.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {t('workspaces.expiresOn', { date: new Date(invitation.expires_at).toLocaleDateString() })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{t(`workspaces.roles.${invitation.role}`)}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('workspaces.workspaceAgents')}</h2>
          </div>

          {agents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">{t('workspaces.noAgents')}</h3>
                <p className="text-sm text-muted-foreground">{t('workspaces.noAgentsDescription')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.purpose}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={agent.status === 'published' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/agents/${agent.id}/settings`}>{t('common.manage')}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('workspaces.dangerZone')}</CardTitle>
                <CardDescription>{t('workspaces.dangerZoneDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" disabled>
                  {t('workspaces.deleteWorkspace')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        workspaceId={workspace.id}
        onInviteSent={loadData}
      />
    </div>
  );
}
