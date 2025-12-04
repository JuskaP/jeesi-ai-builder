import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, Calendar, Play, Pause, RefreshCw, AlertCircle, CheckCircle, History } from 'lucide-react';

interface Props {
  agentId: string;
  userId: string;
}

interface Schedule {
  id: string;
  is_enabled: boolean;
  schedule_type: string;
  cron_expression: string;
  timezone: string;
  prompt_template: string;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
  last_result: any;
  output_action: string;
  output_config: any;
}

interface ScheduledRun {
  id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  generated_content: string | null;
  error_message: string | null;
  credits_used: number;
}

const SCHEDULE_PRESETS = [
  { value: 'hourly', label: 'Every Hour', cron: '0 * * * *' },
  { value: 'daily-9am', label: 'Daily at 9 AM', cron: '0 9 * * *' },
  { value: 'daily-6pm', label: 'Daily at 6 PM', cron: '0 18 * * *' },
  { value: 'weekly-monday', label: 'Weekly (Monday 9 AM)', cron: '0 9 * * 1' },
  { value: 'weekly-friday', label: 'Weekly (Friday 9 AM)', cron: '0 9 * * 5' },
  { value: 'twice-daily', label: 'Twice Daily (9 AM & 6 PM)', cron: '0 9,18 * * *' },
  { value: 'custom', label: 'Custom Cron', cron: '' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/Helsinki', label: 'Helsinki (EET)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

const OUTPUT_ACTIONS = [
  { value: 'store', label: 'Store Only', description: 'Save generated content to history' },
  { value: 'webhook', label: 'Send to Webhook', description: 'POST content to webhook URL (n8n, Zapier, etc.)' },
  { value: 'api_call', label: 'CMS API', description: 'Post to WordPress, Webflow, Ghost, etc.' },
];

const CMS_TEMPLATES = [
  {
    value: 'custom',
    label: 'Custom API',
    description: 'Configure your own API endpoint',
    url: '',
    headers: {},
    placeholder_url: 'https://your-api.com/endpoint',
    instructions: 'Enter your custom API endpoint and headers.'
  },
  {
    value: 'wordpress',
    label: 'WordPress',
    description: 'WordPress REST API (Posts)',
    url: 'https://YOUR-SITE.com/wp-json/wp/v2/posts',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic YOUR_BASE64_ENCODED_CREDENTIALS'
    },
    placeholder_url: 'https://yoursite.com/wp-json/wp/v2/posts',
    instructions: 'Replace YOUR-SITE.com with your domain. For Authorization, base64 encode "username:application_password" (create app password in WP Dashboard → Users → Profile).'
  },
  {
    value: 'webflow',
    label: 'Webflow',
    description: 'Webflow CMS API',
    url: 'https://api.webflow.com/v2/collections/YOUR_COLLECTION_ID/items',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_WEBFLOW_API_TOKEN',
      'accept-version': '2.0.0'
    },
    placeholder_url: 'https://api.webflow.com/v2/collections/COLLECTION_ID/items',
    instructions: 'Get your Collection ID from Webflow CMS settings. Create API token in Webflow Dashboard → Site Settings → Integrations → API Access.'
  },
  {
    value: 'ghost',
    label: 'Ghost',
    description: 'Ghost Admin API',
    url: 'https://YOUR-SITE.ghost.io/ghost/api/admin/posts/',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Ghost YOUR_ADMIN_API_KEY'
    },
    placeholder_url: 'https://yoursite.ghost.io/ghost/api/admin/posts/',
    instructions: 'Get Admin API key from Ghost Admin → Settings → Integrations → Add custom integration. Format: "Ghost {api_key}".'
  },
  {
    value: 'strapi',
    label: 'Strapi',
    description: 'Strapi CMS API',
    url: 'https://YOUR-STRAPI-URL/api/articles',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_STRAPI_API_TOKEN'
    },
    placeholder_url: 'https://your-strapi.com/api/articles',
    instructions: 'Create API token in Strapi Admin → Settings → API Tokens. Replace "articles" with your content type.'
  },
  {
    value: 'contentful',
    label: 'Contentful',
    description: 'Contentful Management API',
    url: 'https://api.contentful.com/spaces/YOUR_SPACE_ID/environments/master/entries',
    headers: {
      'Content-Type': 'application/vnd.contentful.management.v1+json',
      'Authorization': 'Bearer YOUR_MANAGEMENT_TOKEN',
      'X-Contentful-Content-Type': 'blogPost'
    },
    placeholder_url: 'https://api.contentful.com/spaces/SPACE_ID/environments/master/entries',
    instructions: 'Get Space ID from Contentful Settings. Create Management token in Settings → API keys → Content management tokens.'
  }
];

export default function AgentScheduleManager({ agentId, userId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [recentRuns, setRecentRuns] = useState<ScheduledRun[]>([]);
  
  // Form state
  const [isEnabled, setIsEnabled] = useState(false);
  const [schedulePreset, setSchedulePreset] = useState('daily-9am');
  const [customCron, setCustomCron] = useState('0 9 * * *');
  const [timezone, setTimezone] = useState('UTC');
  const [promptTemplate, setPromptTemplate] = useState('Generate an SEO-optimized blog post about [topic]. Include:\n- Engaging headline\n- Meta description (max 160 chars)\n- Introduction\n- 3-5 main sections with H2 headers\n- Conclusion with CTA');
  const [outputAction, setOutputAction] = useState('store');
  const [cmsTemplate, setCmsTemplate] = useState('custom');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiHeaders, setApiHeaders] = useState('');

  useEffect(() => {
    fetchSchedule();
    fetchRecentRuns();
  }, [agentId]);

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_schedules')
        .select('*')
        .eq('agent_id', agentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSchedule(data as Schedule);
        setIsEnabled(data.is_enabled);
        setTimezone(data.timezone);
        setPromptTemplate(data.prompt_template);
        setOutputAction(data.output_action);
        
        // Match preset or set to custom
        const matchingPreset = SCHEDULE_PRESETS.find(p => p.cron === data.cron_expression);
        if (matchingPreset) {
          setSchedulePreset(matchingPreset.value);
        } else {
          setSchedulePreset('custom');
          setCustomCron(data.cron_expression);
        }

        // Load output config
        if (data.output_config && typeof data.output_config === 'object' && !Array.isArray(data.output_config)) {
          const config = data.output_config as Record<string, any>;
          if (data.output_action === 'webhook') {
            setWebhookUrl(config.url || '');
          } else if (data.output_action === 'api_call') {
            setApiUrl(config.url || '');
            setApiHeaders(config.headers ? JSON.stringify(config.headers, null, 2) : '');
            // Load saved template if exists
            if (config.template && CMS_TEMPLATES.some(t => t.value === config.template)) {
              setCmsTemplate(config.template);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRuns = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_runs')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentRuns((data || []) as ScheduledRun[]);
    } catch (error) {
      console.error('Error fetching runs:', error);
    }
  };

  const getCronExpression = () => {
    if (schedulePreset === 'custom') {
      return customCron;
    }
    return SCHEDULE_PRESETS.find(p => p.value === schedulePreset)?.cron || '0 9 * * *';
  };

  const getOutputConfig = () => {
    if (outputAction === 'webhook') {
      return { url: webhookUrl, method: 'POST' };
    } else if (outputAction === 'api_call') {
      let headers = {};
      try {
        headers = apiHeaders ? JSON.parse(apiHeaders) : {};
      } catch (e) {
        // Invalid JSON, ignore
      }
      return { url: apiUrl, method: 'POST', headers, template: cmsTemplate };
    }
    return {};
  };

  const handleCmsTemplateChange = (templateValue: string) => {
    setCmsTemplate(templateValue);
    const template = CMS_TEMPLATES.find(t => t.value === templateValue);
    if (template && templateValue !== 'custom') {
      setApiUrl(template.url);
      setApiHeaders(JSON.stringify(template.headers, null, 2));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cronExpression = getCronExpression();
      const outputConfig = getOutputConfig();

      const scheduleData = {
        agent_id: agentId,
        user_id: userId,
        is_enabled: isEnabled,
        schedule_type: schedulePreset === 'custom' ? 'custom' : schedulePreset.includes('weekly') ? 'weekly' : schedulePreset.includes('hourly') ? 'hourly' : 'daily',
        cron_expression: cronExpression,
        timezone,
        prompt_template: promptTemplate,
        output_action: outputAction,
        output_config: outputConfig,
        next_run_at: isEnabled ? new Date(Date.now() + 60000).toISOString() : null, // Set next run 1 min from now for testing
        updated_at: new Date().toISOString()
      };

      if (schedule) {
        // Update existing
        const { error } = await supabase
          .from('agent_schedules')
          .update(scheduleData)
          .eq('id', schedule.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('agent_schedules')
          .insert(scheduleData);

        if (error) throw error;
      }

      toast.success('Schedule saved successfully');
      fetchSchedule();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast.error(error.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Schedule Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Automated Scheduling
              </CardTitle>
              <CardDescription>
                Run this agent automatically on a schedule
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="enabled" className="text-sm">
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id="enabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Schedule Frequency */}
          <div className="space-y-2">
            <Label>Schedule Frequency</Label>
            <Select value={schedulePreset} onValueChange={setSchedulePreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Cron */}
          {schedulePreset === 'custom' && (
            <div className="space-y-2">
              <Label>Custom Cron Expression</Label>
              <Input
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
                placeholder="0 9 * * *"
              />
              <p className="text-xs text-muted-foreground">
                Format: minute hour day month day_of_week (e.g., "0 9 * * 1" = Monday 9 AM)
              </p>
            </div>
          )}

          {/* Timezone */}
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Template */}
          <div className="space-y-2">
            <Label>Prompt Template</Label>
            <Textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="Enter the prompt that will be sent to the agent..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              This prompt will be sent to the agent on each scheduled run.
            </p>
          </div>

          {/* Output Action */}
          <div className="space-y-4">
            <Label>Output Action</Label>
            <div className="grid gap-3">
              {OUTPUT_ACTIONS.map((action) => (
                <div
                  key={action.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    outputAction === action.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setOutputAction(action.value)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                    outputAction === action.value
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`} />
                  <div>
                    <p className="font-medium">{action.label}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Config */}
          {outputAction === 'webhook' && (
            <div className="space-y-2 p-4 rounded-lg bg-secondary/50 border border-border">
              <Label>Webhook URL</Label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/... or https://n8n.example.com/webhook/..."
              />
              <p className="text-xs text-muted-foreground">
                Generated content will be POSTed to this URL as JSON with: agent_id, agent_name, content, generated_at
              </p>
            </div>
          )}

          {/* API Config */}
          {outputAction === 'api_call' && (
            <div className="space-y-4 p-4 rounded-lg bg-secondary/50 border border-border">
              {/* CMS Template Selector */}
              <div className="space-y-2">
                <Label>CMS Platform</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CMS_TEMPLATES.map((template) => (
                    <div
                      key={template.value}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors text-center ${
                        cmsTemplate === template.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleCmsTemplateChange(template.value)}
                    >
                      <p className="font-medium text-sm">{template.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Instructions */}
              {cmsTemplate !== 'custom' && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong>Setup:</strong> {CMS_TEMPLATES.find(t => t.value === cmsTemplate)?.instructions}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>API URL</Label>
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder={CMS_TEMPLATES.find(t => t.value === cmsTemplate)?.placeholder_url || 'https://your-api.com/endpoint'}
                />
              </div>
              <div className="space-y-2">
                <Label>Headers (JSON)</Label>
                <Textarea
                  value={apiHeaders}
                  onChange={(e) => setApiHeaders(e.target.value)}
                  placeholder='{"Authorization": "Bearer YOUR_TOKEN"}'
                  className="font-mono text-sm min-h-[100px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Replace placeholder values (YOUR_SITE, YOUR_TOKEN, etc.) with your actual credentials.
              </p>
            </div>
          )}

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Schedule'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Schedule Status */}
      {schedule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {schedule.is_enabled ? (
                    <>
                      <Play className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-500">Active</span>
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Paused</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Total Runs</p>
                <p className="font-medium text-lg">{schedule.run_count}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Last Run</p>
                <p className="font-medium text-sm">{formatDate(schedule.last_run_at)}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Next Run</p>
                <p className="font-medium text-sm">{schedule.is_enabled ? formatDate(schedule.next_run_at) : 'Disabled'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Runs */}
      {recentRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    {run.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : run.status === 'failed' ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    )}
                    <div>
                      <p className="font-medium">
                        {run.status === 'completed' ? 'Completed' : 
                         run.status === 'failed' ? 'Failed' : 'Running'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(run.started_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {run.status === 'completed' && (
                      <Badge variant="secondary">
                        {run.credits_used} credit{run.credits_used !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {run.status === 'failed' && run.error_message && (
                      <p className="text-xs text-destructive max-w-[200px] truncate">
                        {run.error_message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
