import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Settings2, Zap, Globe, GitBranch, Webhook, Loader2, GripVertical } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface AgentFunction {
  id: string;
  agent_id: string;
  name: string;
  description: string | null;
  function_type: string;
  trigger_keywords: string[];
  config: Json;
  is_enabled: boolean;
  execution_order: number;
}

interface FunctionTemplate {
  type: string;
  name: string;
  description: string;
  icon: React.ElementType;
  defaultConfig: Record<string, unknown>;
  configFields: ConfigField[];
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

const FUNCTION_TEMPLATES: FunctionTemplate[] = [
  {
    type: 'api_call',
    name: 'API Call',
    description: 'Make HTTP requests to external APIs when triggered',
    icon: Globe,
    defaultConfig: {
      method: 'GET',
      url: '',
      headers: {},
      body_template: '',
    },
    configFields: [
      { key: 'url', label: 'API URL', type: 'text', placeholder: 'https://api.example.com/endpoint', required: true },
      { key: 'method', label: 'HTTP Method', type: 'select', options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
      ]},
      { key: 'headers_json', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer token"}' },
      { key: 'body_template', label: 'Body Template', type: 'textarea', placeholder: '{"query": "{{user_input}}"}' },
    ],
  },
  {
    type: 'conditional',
    name: 'Conditional Response',
    description: 'Respond differently based on keywords or patterns',
    icon: GitBranch,
    defaultConfig: {
      conditions: [],
      default_response: '',
    },
    configFields: [
      { key: 'condition_keyword', label: 'If message contains', type: 'text', placeholder: 'pricing, cost, price' },
      { key: 'condition_response', label: 'Then respond with', type: 'textarea', placeholder: 'Our pricing starts at...' },
      { key: 'default_response', label: 'Default response', type: 'textarea', placeholder: 'Response when no conditions match' },
    ],
  },
  {
    type: 'data_transform',
    name: 'Data Transform',
    description: 'Transform or format data in responses',
    icon: Zap,
    defaultConfig: {
      transform_type: 'format',
      template: '',
    },
    configFields: [
      { key: 'transform_type', label: 'Transform Type', type: 'select', options: [
        { value: 'format', label: 'Format Text' },
        { value: 'extract', label: 'Extract Data' },
        { value: 'summarize', label: 'Summarize' },
      ]},
      { key: 'template', label: 'Output Template', type: 'textarea', placeholder: 'Format: {{data}}' },
    ],
  },
  {
    type: 'webhook',
    name: 'Webhook',
    description: 'Send data to external services on events',
    icon: Webhook,
    defaultConfig: {
      webhook_url: '',
      trigger_event: 'on_response',
      payload_template: '',
    },
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.example.com/webhook', required: true },
      { key: 'trigger_event', label: 'Trigger On', type: 'select', options: [
        { value: 'on_message', label: 'Every Message' },
        { value: 'on_response', label: 'After Response' },
        { value: 'on_keyword', label: 'On Keyword Match' },
      ]},
      { key: 'payload_template', label: 'Payload Template', type: 'textarea', placeholder: '{"message": "{{content}}", "user": "{{user_id}}"}' },
    ],
  },
];

interface Props {
  agentId: string;
}

export default function CustomFunctionsManager({ agentId }: Props) {
  const [functions, setFunctions] = useState<AgentFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FunctionTemplate | null>(null);
  const [newFunction, setNewFunction] = useState({
    name: '',
    description: '',
    trigger_keywords: '',
    config: {} as Record<string, unknown>,
  });

  useEffect(() => {
    fetchFunctions();
  }, [agentId]);

  const fetchFunctions = async () => {
    const { data, error } = await supabase
      .from('agent_functions')
      .select('*')
      .eq('agent_id', agentId)
      .order('execution_order');

    if (error) {
      toast.error('Failed to load functions');
      return;
    }

    setFunctions(data || []);
    setLoading(false);
  };

  const handleAddFunction = async () => {
    if (!selectedTemplate || !newFunction.name) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);

    const { error } = await supabase.from('agent_functions').insert([{
      agent_id: agentId,
      name: newFunction.name,
      description: newFunction.description,
      function_type: selectedTemplate.type,
      trigger_keywords: newFunction.trigger_keywords.split(',').map(k => k.trim()).filter(Boolean),
      config: { ...selectedTemplate.defaultConfig, ...newFunction.config } as Json,
      execution_order: functions.length,
    }]);

    setSaving(false);

    if (error) {
      toast.error('Failed to add function');
      return;
    }

    toast.success('Function added');
    setIsDialogOpen(false);
    setSelectedTemplate(null);
    setNewFunction({ name: '', description: '', trigger_keywords: '', config: {} });
    fetchFunctions();
  };

  const handleToggleFunction = async (func: AgentFunction) => {
    const { error } = await supabase
      .from('agent_functions')
      .update({ is_enabled: !func.is_enabled })
      .eq('id', func.id);

    if (error) {
      toast.error('Failed to update function');
      return;
    }

    setFunctions(prev =>
      prev.map(f => (f.id === func.id ? { ...f, is_enabled: !f.is_enabled } : f))
    );
  };

  const handleDeleteFunction = async (id: string) => {
    const { error } = await supabase.from('agent_functions').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete function');
      return;
    }

    toast.success('Function deleted');
    setFunctions(prev => prev.filter(f => f.id !== id));
  };

  const getTemplateIcon = (type: string) => {
    const template = FUNCTION_TEMPLATES.find(t => t.type === type);
    return template?.icon || Settings2;
  };

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Custom Functions
            </CardTitle>
            <CardDescription>
              Add predefined actions that your agent can perform when triggered
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Function
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Custom Function</DialogTitle>
                <DialogDescription>
                  Choose a function template and configure it for your agent
                </DialogDescription>
              </DialogHeader>

              {!selectedTemplate ? (
                <div className="grid grid-cols-2 gap-3 py-4">
                  {FUNCTION_TEMPLATES.map((template) => (
                    <button
                      key={template.type}
                      onClick={() => setSelectedTemplate(template)}
                      className="flex flex-col items-start p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-all text-left"
                    >
                      <template.icon className="h-8 w-8 text-primary mb-2" />
                      <span className="font-medium">{template.name}</span>
                      <span className="text-sm text-muted-foreground">{template.description}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    ← Back to templates
                  </Button>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <selectedTemplate.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{selectedTemplate.name}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="func-name">Function Name *</Label>
                      <Input
                        id="func-name"
                        value={newFunction.name}
                        onChange={(e) => setNewFunction(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Get Weather Data"
                      />
                    </div>

                    <div>
                      <Label htmlFor="func-desc">Description</Label>
                      <Input
                        id="func-desc"
                        value={newFunction.description}
                        onChange={(e) => setNewFunction(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What does this function do?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="func-keywords">Trigger Keywords (comma-separated)</Label>
                      <Input
                        id="func-keywords"
                        value={newFunction.trigger_keywords}
                        onChange={(e) => setNewFunction(prev => ({ ...prev, trigger_keywords: e.target.value }))}
                        placeholder="weather, forecast, temperature"
                      />
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <h4 className="font-medium">Configuration</h4>
                      {selectedTemplate.configFields.map((field) => (
                        <div key={field.key}>
                          <Label htmlFor={field.key}>
                            {field.label} {field.required && '*'}
                          </Label>
                          {field.type === 'select' ? (
                            <Select
                              value={(newFunction.config[field.key] as string) || ''}
                              onValueChange={(value) =>
                                setNewFunction(prev => ({
                                  ...prev,
                                  config: { ...prev.config, [field.key]: value },
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === 'textarea' ? (
                            <Textarea
                              id={field.key}
                              value={(newFunction.config[field.key] as string) || ''}
                              onChange={(e) =>
                                setNewFunction(prev => ({
                                  ...prev,
                                  config: { ...prev.config, [field.key]: e.target.value },
                                }))
                              }
                              placeholder={field.placeholder}
                              rows={3}
                            />
                          ) : (
                            <Input
                              id={field.key}
                              type={field.type}
                              value={(newFunction.config[field.key] as string) || ''}
                              onChange={(e) =>
                                setNewFunction(prev => ({
                                  ...prev,
                                  config: { ...prev.config, [field.key]: e.target.value },
                                }))
                              }
                              placeholder={field.placeholder}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddFunction} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Add Function
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {functions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No custom functions yet</p>
            <p className="text-sm">Add functions to extend your agent's capabilities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {functions.map((func) => {
              const Icon = getTemplateIcon(func.function_type);
              return (
                <div
                  key={func.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    func.is_enabled ? 'border-border' : 'border-border/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{func.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {func.function_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      {func.description && (
                        <p className="text-sm text-muted-foreground">{func.description}</p>
                      )}
                      {func.trigger_keywords.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {func.trigger_keywords.slice(0, 3).map((kw) => (
                            <Badge key={kw} variant="outline" className="text-xs">
                              {kw}
                            </Badge>
                          ))}
                          {func.trigger_keywords.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{func.trigger_keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={func.is_enabled}
                      onCheckedChange={() => handleToggleFunction(func)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFunction(func.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
