import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Shield, BarChart3, MessageSquare, AlertTriangle, Loader2 } from 'lucide-react';

interface ConsentOptions {
  metadata_collection: boolean;
  usage_analytics: boolean;
  prompt_analysis: boolean;
  error_tracking: boolean;
}

export default function ConsentSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [consent, setConsent] = useState<ConsentOptions>({
    metadata_collection: false,
    usage_analytics: false,
    prompt_analysis: false,
    error_tracking: false,
  });

  useEffect(() => {
    if (user) {
      fetchConsent();
    }
  }, [user]);

  const fetchConsent = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_consent')
      .select('metadata_collection, usage_analytics, prompt_analysis, error_tracking')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setConsent(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('user_consent')
      .update({
        ...consent,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      // If no record exists, create one
      const { error: insertError } = await supabase.from('user_consent').insert({
        user_id: user.id,
        ...consent,
        consented_at: new Date().toISOString(),
      });

      if (insertError) {
        toast.error('Failed to save preferences');
        return;
      }
    }

    toast.success('Privacy preferences saved');
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Data Collection
        </CardTitle>
        <CardDescription>
          Control what data we collect to improve your experience. Your data is encrypted and never shared with third parties.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {consentItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 rounded-lg border border-border"
          >
            <div className="flex items-start gap-3">
              <item.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label htmlFor={item.key} className="font-medium cursor-pointer">
                  {item.title}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
            <Switch
              id={item.key}
              checked={consent[item.key]}
              onCheckedChange={(checked) =>
                setConsent((prev) => ({ ...prev, [item.key]: checked }))
              }
            />
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setConsent({
                metadata_collection: false,
                usage_analytics: false,
                prompt_analysis: false,
                error_tracking: false,
              })
            }
          >
            Disable All
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setConsent({
                metadata_collection: true,
                usage_analytics: true,
                prompt_analysis: true,
                error_tracking: true,
              })
            }
          >
            Enable All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
