import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Invitation {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  workspace: {
    name: string;
    description: string | null;
  };
}

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    if (!token) {
      setError(t('workspaces.invalidToken'));
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to auth with return URL
        navigate(`/auth?redirect=/invite/${token}`);
        return;
      }

      const { data, error } = await supabase
        .from('workspace_invitations')
        .select(`
          id,
          workspace_id,
          email,
          role,
          status,
          expires_at,
          workspace:workspaces(name, description)
        `)
        .eq('token', token)
        .single();

      if (error || !data) {
        setError(t('workspaces.invitationNotFound'));
        return;
      }

      const inv = data as any;

      // Check if invitation is for this user
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      if (profile?.email?.toLowerCase() !== inv.email.toLowerCase()) {
        setError(t('workspaces.wrongEmail'));
        return;
      }

      if (inv.status !== 'pending') {
        setError(t('workspaces.invitationUsed'));
        return;
      }

      if (new Date(inv.expires_at) < new Date()) {
        setError(t('workspaces.invitationExpired'));
        return;
      }

      setInvitation(inv);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    setIsAccepting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Add user as member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: invitation.workspace_id,
          user_id: user.id,
          role: invitation.role as 'admin' | 'editor' | 'viewer' | 'owner',
          invited_by: user.id,
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('workspace_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      toast({
        title: t('workspaces.invitationAccepted'),
        description: t('workspaces.welcomeToWorkspace', { name: invitation.workspace.name }),
      });

      navigate(`/workspaces/${invitation.workspace_id}`);
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;

    try {
      await supabase
        .from('workspace_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id);

      toast({ title: t('workspaces.invitationDeclined') });
      navigate('/workspaces');
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('workspaces.invitationError')}</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/workspaces')}>
              {t('workspaces.backToWorkspaces')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle>{t('workspaces.joinWorkspace')}</CardTitle>
          <CardDescription>
            {t('workspaces.invitedTo', { workspace: invitation.workspace.name })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg mb-1">{invitation.workspace.name}</h3>
            {invitation.workspace.description && (
              <p className="text-sm text-muted-foreground">{invitation.workspace.description}</p>
            )}
            <p className="text-sm mt-2">
              {t('workspaces.yourRole')}: <span className="font-medium">{t(`workspaces.roles.${invitation.role}`)}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleDecline}>
              {t('workspaces.decline')}
            </Button>
            <Button className="flex-1" onClick={handleAccept} disabled={isAccepting}>
              {isAccepting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {t('workspaces.accept')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
