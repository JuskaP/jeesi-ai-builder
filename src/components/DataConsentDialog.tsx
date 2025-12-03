import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Shield, BarChart3, MessageSquare, AlertTriangle } from 'lucide-react';

interface ConsentOptions {
  metadata_collection: boolean;
  usage_analytics: boolean;
  prompt_analysis: boolean;
  error_tracking: boolean;
}

export default function DataConsentDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState<ConsentOptions>({
    metadata_collection: false,
    usage_analytics: false,
    prompt_analysis: false,
    error_tracking: false,
  });

  useEffect(() => {
    if (user) {
      checkConsentStatus();
    }
  }, [user]);

  const checkConsentStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_consent')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No consent record exists, show dialog
      setOpen(true);
    } else if (data) {
      // Consent already given, don't show dialog
      setOpen(false);
    }
  };

  const handleSaveConsent = async (acceptAll: boolean = false) => {
    if (!user) return;
    setLoading(true);

    const consentData = acceptAll
      ? {
          metadata_collection: true,
          usage_analytics: true,
          prompt_analysis: true,
          error_tracking: true,
        }
      : consent;

    const { error } = await supabase.from('user_consent').insert({
      user_id: user.id,
      ...consentData,
      consented_at: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to save preferences');
      return;
    }

    toast.success('Preferences saved');
    setOpen(false);
  };

  const handleDeclineAll = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('user_consent').insert({
      user_id: user.id,
      metadata_collection: false,
      usage_analytics: false,
      prompt_analysis: false,
      error_tracking: false,
      consented_at: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to save preferences');
      return;
    }

    toast.success('Preferences saved');
    setOpen(false);
  };

  const consentItems = [
    {
      key: 'metadata_collection' as const,
      icon: Shield,
      title: 'Platform Metadata',
      description: 'Basic usage data like session duration and feature usage to improve the platform.',
    },
    {
      key: 'usage_analytics' as const,
      icon: BarChart3,
      title: 'Usage Analytics',
      description: 'How you interact with agents, response times, and performance metrics.',
    },
    {
      key: 'prompt_analysis' as const,
      icon: MessageSquare,
      title: 'Prompt Analysis',
      description: 'Anonymous analysis of prompts to improve agent responses and suggestions.',
    },
    {
      key: 'error_tracking' as const,
      icon: AlertTriangle,
      title: 'Error Tracking',
      description: 'Track issues and errors to identify and fix common problems.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Help Us Improve Jeesi.ai
          </DialogTitle>
          <DialogDescription>
            We'd like to collect some data to improve our platform and your experience. 
            You can choose what data you're comfortable sharing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {consentItems.map((item) => (
            <div
              key={item.key}
              className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={item.key}
                checked={consent[item.key]}
                onCheckedChange={(checked) =>
                  setConsent((prev) => ({ ...prev, [item.key]: checked === true }))
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor={item.key}
                  className="flex items-center gap-2 font-medium cursor-pointer"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.title}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Your data is encrypted and never shared with third parties. You can change these 
          preferences anytime in your profile settings.
        </p>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDeclineAll} disabled={loading}>
            Decline All
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSaveConsent(false)}
            disabled={loading}
          >
            Save Selected
          </Button>
          <Button onClick={() => handleSaveConsent(true)} disabled={loading}>
            Accept All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
