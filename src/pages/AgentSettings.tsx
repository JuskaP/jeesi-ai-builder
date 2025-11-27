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
import { ArrowLeft, Plus, Trash2, Save, TestTube } from 'lucide-react';

const AI_MODELS = [
  {
    value: 'google/gemini-2.5-flash',
    label: 'Google Gemini 2.5 Flash',
    description: 'Tasapainoinen malli, sopii useimpiin käyttötarkoituksiin',
    indicator: '💚 Suositeltu'
  },
  {
    value: 'google/gemini-2.5-pro',
    label: 'Google Gemini 2.5 Pro',
    description: 'Tehokkain Gemini-malli monimutkaista päättelyä varten',
    indicator: '🔥 Tehokkain'
  },
  {
    value: 'google/gemini-2.5-flash-lite',
    label: 'Google Gemini 2.5 Flash Lite',
    description: 'Nopein ja halvin, sopii yksinkertaisiin tehtäviin',
    indicator: '⚡ Nopein'
  },
  {
    value: 'openai/gpt-5',
    label: 'OpenAI GPT-5',
    description: 'Premium-malli, paras tarkkuus ja monimutkaiset tehtävät',
    indicator: '💎 Premium'
  },
  {
    value: 'openai/gpt-5-mini',
    label: 'OpenAI GPT-5 Mini',
    description: 'Kustannustehokas versio GPT-5:stä',
    indicator: '💰 Kustannustehokas'
  }
];

export default function AgentSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchAgent();
  }, [id, user, navigate]);

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
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      toast.error('Agentin lataaminen epäonnistui');
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
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Asetukset tallennettu!');
    } catch (error) {
      console.error('Error saving agent:', error);
      toast.error('Tallentaminen epäonnistui');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Ladataan...</div>
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
              Takaisin
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Agentin asetukset</h1>
            <p className="text-muted-foreground mt-1">{name}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Perustiedot */}
          <Card>
            <CardHeader>
              <CardTitle>Perustiedot</CardTitle>
              <CardDescription>Agentin nimi ja kuvaus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nimi</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Esim. Asiakaspalveluagentti"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Kuvaus</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Lyhyt kuvaus agentin tarkoituksesta"
                />
              </div>
            </CardContent>
          </Card>

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
              <CardTitle>AI-malli</CardTitle>
              <CardDescription>Valitse agenttisi käyttämä tekoälymalli</CardDescription>
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
                  ℹ️ {selectedModel.description}
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
              <CardTitle>Max Tokens: {maxTokens[0]}</CardTitle>
              <CardDescription>Vastausten maksimipituus</CardDescription>
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

          {/* Julkaisu */}
          <Card>
            <CardHeader>
              <CardTitle>Julkaisu</CardTitle>
              <CardDescription>Ota agentti käyttöön API:n kautta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Julkaise agentti</Label>
                  <p className="text-sm text-muted-foreground">
                    Julkaistut agentit kuluttavat krediittejä
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              {isPublished && (
                <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                  <p className="text-sm text-foreground">
                    ⚠️ Agenttisi on julkaistu ja käytettävissä API:n kautta. Jokainen API-kutsu kuluttaa krediittejä.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="lg" disabled>
              <TestTube className="mr-2 h-4 w-4" />
              Testaa agenttia
            </Button>
            <Button size="lg" onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Tallennetaan...' : 'Tallenna muutokset'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
