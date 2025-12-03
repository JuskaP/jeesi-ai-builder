import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onInviteSent: () => void;
}

type WorkspaceRole = 'admin' | 'editor' | 'viewer';

export default function InviteMemberDialog({ open, onOpenChange, workspaceId, onInviteSent }: InviteMemberDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('viewer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (existingMember) {
        const { data: alreadyMember } = await supabase
          .from('workspace_members')
          .select('id')
          .eq('workspace_id', workspaceId)
          .eq('user_id', existingMember.id)
          .maybeSingle();

        if (alreadyMember) {
          throw new Error(t('workspaces.alreadyMember'));
        }
      }

      // Check for existing pending invitation
      const { data: existingInvite } = await supabase
        .from('workspace_invitations')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('email', email.trim().toLowerCase())
        .eq('status', 'pending')
        .maybeSingle();

      if (existingInvite) {
        throw new Error(t('workspaces.alreadyInvited'));
      }

      // Create invitation
      const { error } = await supabase
        .from('workspace_invitations')
        .insert({
          workspace_id: workspaceId,
          email: email.trim().toLowerCase(),
          invited_by: user.id,
          role: role,
        });

      if (error) throw error;

      toast({
        title: t('workspaces.inviteSent'),
        description: t('workspaces.inviteSentDescription', { email: email.trim() }),
      });

      setEmail('');
      setRole('viewer');
      onOpenChange(false);
      onInviteSent();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('workspaces.inviteTitle')}</DialogTitle>
          <DialogDescription>{t('workspaces.inviteDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('workspaces.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('workspaces.emailPlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('workspaces.roleLabel')}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as WorkspaceRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('workspaces.roles.admin')}</SelectItem>
                  <SelectItem value="editor">{t('workspaces.roles.editor')}</SelectItem>
                  <SelectItem value="viewer">{t('workspaces.roles.viewer')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t(`workspaces.roleDescriptions.${role}`)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? t('common.sending') : t('workspaces.sendInvite')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
