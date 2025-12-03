import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Save, TestTube, Users, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Workspace {
  id: string;
  name: string;
}

const AI_MODELS = [
  {
    value: 'google/gemini-2.5-flash',
    label: 'Google Gemini 2.5 Flash',
    descriptionKey: 'agentSettings.aiModel.models.gemini-flash.description',
    indicator: '💚'
  },
  {
    value: 'google/gemini-2.5-pro',
    label: 'Google Gemini 2.5 Pro',
    descriptionKey: 'agentSettings.aiModel.models.gemini-pro.description',
    indicator: '🔥'
  },
  {
    value: 'google/gemini-2.5-flash-lite',
    label: 'Google Gemini 2.5 Flash Lite',
    descriptionKey: 'agentSettings.aiModel.models.gemini-lite.description',
    indicator: '⚡'
  },
  {
    value: 'openai/gpt-5',
    label: 'OpenAI GPT-5',
    descriptionKey: 'agentSettings.aiModel.models.gpt-5.description',
    indicator: '💎'
  },
  {
    value: 'openai/gpt-5-mini',
    label: 'OpenAI GPT-5 Mini',
    descriptionKey: 'agentSettings.aiModel.models.gpt-5-mini.description',
    indicator: '💰'
  }
];

export default function AgentSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [aiModel, setAiModel] = useState('google/gemini-2.5-flash');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);
  const [newKnowledge, setNewKnowledge] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isHeavy, setIsHeavy] = useState(false);
  const [railwayUrl, setRailwayUrl] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchAgent();
    fetchWorkspaces();
  }, [id, user, navigate, authLoading]);

  const fetchWorkspaces = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          workspace:workspaces(id, name)
        `)
        .eq('user_id', user.id)
        .in('role', ['owner', 'admin', 'editor']);

      if (error) throw error;
      
      const ws = (data || [])
        .map((m: any) => m.workspace)
        .filter(Boolean) as Workspace[];
      
      setWorkspaces(ws);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const fetchAgent = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setName(data.name || '');
        setDescription(data.description || '');
        setSystemPrompt(data.system_prompt || 'Olet avulias AI-assistentti.');
        setAiModel(data.ai_model || 'google/gemini-2.5-flash');
        setTemperature([data.temperature || 0.7]);
        setMaxTokens([data.max_tokens || 1000]);
        
        // Type guard for knowledge_base
        const kb = data.knowledge_base;
        if (Array.isArray(kb) && kb.every(item => typeof item === 'string')) {
          setKnowledgeBase(kb as string[]);
        } else {
          setKnowledgeBase([]);
        }
        
        setIsPublished(data.is_published || false);
        setIsHeavy(data.is_heavy || false);
        setRailwayUrl(data.railway_url || '');
        setWorkspaceId(data.workspace_id || null);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      toast.error(t('agentSettings.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          name,
          description,
          system_prompt: systemPrompt,
          ai_model: aiModel,
          temperature: temperature[0],
          max_tokens: maxTokens[0],
          knowledge_base: knowledgeBase,
          is_published: isPublished,
          is_heavy: isHeavy,
          railway_url: railwayUrl || null,
          workspace_id: workspaceId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success(t('agentSettings.messages.saveSuccess'));
    } catch (error) {
      console.error('Error saving agent:', error);
      toast.error(t('agentSettings.messages.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const addKnowledge = () => {
    if (newKnowledge.trim()) {
      setKnowledgeBase([...knowledgeBase, newKnowledge.trim()]);
      setNewKnowledge('');
    }
  };

  const removeKnowledge = (index: number) => {
    setKnowledgeBase(knowledgeBase.filter((_, i) => i !== index));
  };

  const selectedModel = AI_MODELS.find(m => m.value === aiModel);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('agentSettings.back')}
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{t('agentSettings.title')}</h1>
            <p className="text-muted-foreground mt-1">{name}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Perustiedot */}
          <Card>
            <CardHeader>
              <CardTitle>{t('agentSettings.basicInfo.title')}</CardTitle>
              <CardDescription>{t('agentSettings.basicInfo.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('agentSettings.basicInfo.name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Esim. Asiakaspalveluagentti"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('agentSettings.basicInfo.description')}</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('agentSettings.basicInfo.description')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Workspace Assignment */}
          {workspaces.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('agentSettings.workspace.title')}
                </CardTitle>
                <CardDescription>{t('agentSettings.workspace.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={workspaceId || 'none'} 
                  onValueChange={(v) => setWorkspaceId(v === 'none' ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('agentSettings.workspace.selectPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('agentSettings.workspace.personal')}</SelectItem>
                    {workspaces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  {workspaceId 
                    ? t('agentSettings.workspace.sharedHint')
                    : t('agentSettings.workspace.personalHint')
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* System Prompt */}
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
              <CardDescription>Määritä agentin persoonallisuus ja ohjeet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Esim. Olet ystävällinen asiakaspalvelija joka auttaa asiakkaita..."
                  className="min-h-[150px]"
                />
                <p className="text-sm text-muted-foreground">
                  {systemPrompt.length}/2000 merkkiä
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI-malli */}
          <Card>
            <CardHeader>
              <CardTitle>{t('agentSettings.aiModel.title')}</CardTitle>
              <CardDescription>{t('agentSettings.aiModel.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <span>{model.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {model.indicator}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModel && (
                <p className="text-sm text-muted-foreground">
                  ℹ️ {t(selectedModel.descriptionKey)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Lämpötila */}
          <Card>
            <CardHeader>
              <CardTitle>Lämpötila: {temperature[0].toFixed(1)}</CardTitle>
              <CardDescription>Säädä vastausten luovuutta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tarkka/Johdonmukainen</span>
                  <span>Luova/Vaihteleva</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Max Tokens */}
          <Card>
            <CardHeader>
              <CardTitle>{t('agentSettings.maxTokens.title')}: {maxTokens[0]}</CardTitle>
              <CardDescription>{t('agentSettings.maxTokens.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  min={100}
                  max={4000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>100 tokenia</span>
                  <span>4000 tokenia</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Token ≈ 0.75 sanaa. {maxTokens[0]} tokenia ≈ {Math.round(maxTokens[0] * 0.75)} sanaa.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card>
            <CardHeader>
              <CardTitle>Tietopohja</CardTitle>
              <CardDescription>Lisää agenttisi käyttöön tärkeää tietoa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newKnowledge}
                  onChange={(e) => setNewKnowledge(e.target.value)}
                  placeholder="Esim. Yrityksen aukioloajat: ma-pe 9-17"
                  onKeyPress={(e) => e.key === 'Enter' && addKnowledge()}
                />
                <Button onClick={addKnowledge} size="icon" variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {knowledgeBase.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-md bg-secondary/50 border border-border"
                  >
                    <p className="flex-1 text-sm">{item}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeKnowledge(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {knowledgeBase.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Ei tietopohjaa. Lisää ensimmäinen tietokohde yllä.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Railway Configuration */}
          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Advanced</Badge>
                Railway Backend Execution
              </CardTitle>
              <CardDescription>
                Enable Railway backend for complex agents requiring longer execution times, more memory, or persistent connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="heavy">Execute on Railway Backend</Label>
                  <p className="text-sm text-muted-foreground">
                    Routes agent execution to Railway for complex workloads
                  </p>
                </div>
                <Switch
                  id="heavy"
                  checked={isHeavy}
                  onCheckedChange={setIsHeavy}
                />
              </div>
              
              {isHeavy && (
                <div className="space-y-2">
                  <Label htmlFor="railwayUrl">Custom Railway URL (Optional)</Label>
                  <Input
                    id="railwayUrl"
                    value={railwayUrl}
                    onChange={(e) => setRailwayUrl(e.target.value)}
                    placeholder="https://yourapp.up.railway.app"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use the default Railway backend URL from environment
                  </p>
                </div>
              )}

              {isHeavy && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Heavy Agent Features:
                  </p>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                    <li>• No 60-second timeout limit</li>
                    <li>• Higher memory allocation</li>
                    <li>• WebSocket support for real-time streaming</li>
                    <li>• Support for complex dependencies</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Julkaisu */}
          <Card>
            <CardHeader>
              <CardTitle>{t('agentSettings.publishing.title')}</CardTitle>
              <CardDescription>{t('agentSettings.publishing.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="publish">{t('agentSettings.publishing.toggle')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('agentSettings.publishing.warning')}
                  </p>
                </div>
                <Switch
                  id="publish"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              {isPublished && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-primary">
                    ✓ {t('agentSettings.publishing.published')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end pt-4">
            <Button variant="outline" size="lg" asChild>
              <Link to={`/agents/${id}/diagnostics`}>
                <Activity className="mr-2 h-4 w-4" />
                Diagnostics
              </Link>
            </Button>
            <Button variant="outline" size="lg" disabled>
              <TestTube className="mr-2 h-4 w-4" />
              {t('agentSettings.actions.test')}
            </Button>
            <Button size="lg" onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? t('agentSettings.actions.saving') : t('agentSettings.actions.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
