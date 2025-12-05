import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Paintbrush, Image, MessageSquare, Crown, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WhiteLabelSettingsProps {
  agentId: string;
  hasAccess: boolean; // Business+ tier check
}

interface BrandingConfig {
  hide_badge: boolean;
  custom_name: string;
  primary_color: string;
  logo_url: string;
  welcome_message: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  hide_badge: false,
  custom_name: '',
  primary_color: '#3b82f6',
  logo_url: '',
  welcome_message: "Hi! I'm your AI assistant. How can I help you today?"
};

export default function WhiteLabelSettings({ agentId, hasAccess }: WhiteLabelSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(false);
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);

  useEffect(() => {
    fetchSettings();
  }, [agentId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (error) throw error;

      if (data) {
        // Cast to any to access new columns not yet in types
        const agentData = data as any;
        setWhiteLabelEnabled(agentData.white_label_enabled || false);
        const savedBranding = agentData.custom_branding as Record<string, any> | null;
        if (savedBranding && typeof savedBranding === 'object') {
          setBranding({
            hide_badge: savedBranding.hide_badge ?? DEFAULT_BRANDING.hide_badge,
            custom_name: savedBranding.custom_name ?? DEFAULT_BRANDING.custom_name,
            primary_color: savedBranding.primary_color ?? DEFAULT_BRANDING.primary_color,
            logo_url: savedBranding.logo_url ?? DEFAULT_BRANDING.logo_url,
            welcome_message: savedBranding.welcome_message ?? DEFAULT_BRANDING.welcome_message,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching white label settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasAccess) {
      toast.error('Upgrade to Business tier or higher to access white label features');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          white_label_enabled: whiteLabelEnabled,
          custom_branding: JSON.parse(JSON.stringify(branding)),
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId);

      if (error) throw error;
      toast.success('White label settings saved');
    } catch (error: any) {
      console.error('Error saving white label settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading white label settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className={!hasAccess ? 'opacity-75' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                White Label Settings
              </CardTitle>
              <CardDescription>
                Customize your agent's appearance and remove Jeesi.ai branding
              </CardDescription>
            </div>
            {!hasAccess && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Business+ Required
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable White Label */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border">
            <div className="space-y-0.5">
              <Label className="text-base">Enable White Labeling</Label>
              <p className="text-sm text-muted-foreground">
                Apply custom branding to your embedded agent
              </p>
            </div>
            <Switch
              checked={whiteLabelEnabled}
              onCheckedChange={setWhiteLabelEnabled}
              disabled={!hasAccess}
            />
          </div>

          {whiteLabelEnabled && (
            <>
              {/* Hide Badge */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Hide "Powered by Jeesi.ai" Badge</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove the Jeesi.ai attribution from the widget
                  </p>
                </div>
                <Switch
                  checked={branding.hide_badge}
                  onCheckedChange={(checked) => setBranding(prev => ({ ...prev, hide_badge: checked }))}
                  disabled={!hasAccess}
                />
              </div>

              {/* Custom Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Custom Assistant Name
                </Label>
                <Input
                  value={branding.custom_name}
                  onChange={(e) => setBranding(prev => ({ ...prev, custom_name: e.target.value }))}
                  placeholder="My AI Assistant"
                  disabled={!hasAccess}
                />
                <p className="text-xs text-muted-foreground">
                  Displayed in the widget header instead of default name
                </p>
              </div>

              {/* Primary Color */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Paintbrush className="h-4 w-4" />
                  Primary Color
                </Label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={branding.primary_color}
                    onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer border"
                    disabled={!hasAccess}
                  />
                  <Input
                    value={branding.primary_color}
                    onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1"
                    disabled={!hasAccess}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for buttons, links, and accent colors in the widget
                </p>
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Logo URL
                </Label>
                <Input
                  value={branding.logo_url}
                  onChange={(e) => setBranding(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://your-site.com/logo.png"
                  disabled={!hasAccess}
                />
                <p className="text-xs text-muted-foreground">
                  Your logo displayed in the widget header (recommended: 32x32px)
                </p>
              </div>

              {/* Welcome Message */}
              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Textarea
                  value={branding.welcome_message}
                  onChange={(e) => setBranding(prev => ({ ...prev, welcome_message: e.target.value }))}
                  placeholder="Hi! I'm your AI assistant. How can I help you today?"
                  className="min-h-[80px]"
                  disabled={!hasAccess}
                />
                <p className="text-xs text-muted-foreground">
                  The initial message displayed when the widget opens
                </p>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div 
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: branding.primary_color + '10' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {branding.logo_url ? (
                      <img 
                        src={branding.logo_url} 
                        alt="Logo" 
                        className="w-8 h-8 rounded"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: branding.primary_color }}
                      >
                        AI
                      </div>
                    )}
                    <span className="font-semibold">
                      {branding.custom_name || 'AI Assistant'}
                    </span>
                  </div>
                  <div 
                    className="p-3 rounded-lg text-sm"
                    style={{ backgroundColor: branding.primary_color + '20' }}
                  >
                    {branding.welcome_message || "Hi! I'm your AI assistant. How can I help you today?"}
                  </div>
                  {!branding.hide_badge && (
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Powered by Jeesi.ai
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          <Button 
            onClick={handleSave} 
            disabled={saving || !hasAccess}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save White Label Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}