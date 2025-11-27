import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Copy, ArrowLeft, Code, Globe, Settings } from 'lucide-react';

export default function EmbedAgent() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchAgent();
    }
  }, [id, user]);

  const fetchAgent = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent:', error);
      toast.error('Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const embedCode = `<!-- Jeesi.ai Agent Widget -->
<div id="jeesi-agent-${id}"></div>
<script src="${window.location.origin}/widget.js"></script>
<script>
  JeesiWidget.init({
    agentId: '${id}',
    apiKey: 'YOUR_API_KEY',
    containerId: 'jeesi-agent-${id}',
    theme: 'light', // 'light' or 'dark'
    position: 'bottom-right' // 'bottom-right', 'bottom-left', 'inline'
  });
</script>`;

  const iframeCode = `<iframe
  src="${window.location.origin}/chat/${id}?apiKey=YOUR_API_KEY"
  width="400"
  height="600"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 12px;"
></iframe>`;

  const apiExample = `// Using fetch
const response = await fetch('${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-runtime', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    agentId: '${id}',
    messages: [
      { role: 'user', content: 'Hello!' }
    ]
  })
});

const data = await response.json();
console.log(data);`;

  const curlExample = `curl -X POST '${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-runtime' \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: YOUR_API_KEY' \\
  -d '{
    "agentId": "${id}",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Agent Not Found</h2>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/agents/${id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Agent Settings
            </Link>
          </Button>
        </div>

        {/* Agent Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{agent.name}</CardTitle>
            <CardDescription>{agent.description}</CardDescription>
          </CardHeader>
        </Card>

        {/* Integration Options */}
        <Tabs defaultValue="widget" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="widget">
              <Code className="mr-2 h-4 w-4" />
              Widget
            </TabsTrigger>
            <TabsTrigger value="iframe">
              <Globe className="mr-2 h-4 w-4" />
              iFrame
            </TabsTrigger>
            <TabsTrigger value="api">
              <Code className="mr-2 h-4 w-4" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="widget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Embed Widget</CardTitle>
                <CardDescription>
                  Add this code to your website to embed the agent as a chat widget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">HTML Code</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(embedCode)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{embedCode}</code>
                  </pre>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Note:</strong> Replace <code>YOUR_API_KEY</code> with your actual API key from the Profile page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iframe" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>iFrame Embed</CardTitle>
                <CardDescription>
                  Embed the agent directly using an iframe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">iFrame Code</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(iframeCode)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{iframeCode}</code>
                  </pre>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Adjust the <code>width</code> and <code>height</code> attributes to fit your design.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Integration</CardTitle>
                <CardDescription>
                  Call your agent programmatically via REST API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">JavaScript Example</label>
                  <div className="flex items-center justify-end mb-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(apiExample)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{apiExample}</code>
                  </pre>
                </div>

                <div>
                  <label className="text-sm font-medium">cURL Example</label>
                  <div className="flex items-center justify-end mb-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(curlExample)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{curlExample}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Next Steps */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">1.</span>
              <p>Generate an API key from your <Link to="/profile" className="underline">Profile page</Link></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">2.</span>
              <p>Replace <code className="bg-muted px-1 rounded">YOUR_API_KEY</code> in the code above</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">3.</span>
              <p>Make sure your agent is <strong>published</strong> in <Link to={`/agents/${id}/settings`} className="underline">settings</Link></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">4.</span>
              <p>Test the integration and monitor usage from your dashboard</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
