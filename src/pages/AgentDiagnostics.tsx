import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Activity, MessageSquare, Sparkles, TestTube } from 'lucide-react';
import AgentHealthDashboard from '@/components/diagnostics/AgentHealthDashboard';
import ConversationLogs from '@/components/diagnostics/ConversationLogs';
import HelpieDiagnostics from '@/components/diagnostics/HelpieDiagnostics';
import TestSuite from '@/components/diagnostics/TestSuite';

interface AgentConfig {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
  ai_model: string | null;
  temperature: number | null;
  max_tokens: number | null;
  is_published: boolean | null;
  is_heavy: boolean | null;
  knowledge_base: any;
}

export default function AgentDiagnostics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchAgent();
  }, [id, user, navigate, authLoading]);

  const fetchAgent = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Agent not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/agents/${id}/settings`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Diagnostics</h1>
            <p className="text-muted-foreground mt-1">{agent.name}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="health" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="helpie" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Helpie</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              <span className="hidden sm:inline">Tests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <AgentHealthDashboard agentId={id!} />
          </TabsContent>

          <TabsContent value="logs">
            <ConversationLogs agentId={id!} />
          </TabsContent>

          <TabsContent value="helpie">
            <HelpieDiagnostics agentId={id!} agentConfig={agent} />
          </TabsContent>

          <TabsContent value="tests">
            <TestSuite agentId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
