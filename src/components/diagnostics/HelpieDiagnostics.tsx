import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Bot, User, Loader2, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

interface DiagnosticMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentConfig {
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

interface HelpieDiagnosticsProps {
  agentId: string;
  agentConfig: AgentConfig;
}

export default function HelpieDiagnostics({ agentId, agentConfig }: HelpieDiagnosticsProps) {
  const [messages, setMessages] = useState<DiagnosticMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeProblem = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Build context about the agent for AI analysis
      const agentContext = `
Agent Configuration:
- Name: ${agentConfig.name}
- Description: ${agentConfig.description || 'Not set'}
- AI Model: ${agentConfig.ai_model || 'google/gemini-2.5-flash'}
- Temperature: ${agentConfig.temperature || 0.7}
- Max Tokens: ${agentConfig.max_tokens || 1000}
- Published: ${agentConfig.is_published ? 'Yes' : 'No'}
- Heavy Execution (Railway): ${agentConfig.is_heavy ? 'Yes' : 'No'}
- Knowledge Base Items: ${Array.isArray(agentConfig.knowledge_base) ? agentConfig.knowledge_base.length : 0}
- System Prompt Length: ${agentConfig.system_prompt?.length || 0} characters
`;

      const systemPrompt = `You are Helpie, an AI diagnostics assistant for Jeesi.ai platform. Your role is to help users troubleshoot issues with their AI agents.

${agentContext}

When analyzing problems:
1. Consider the agent's configuration (model, temperature, tokens, etc.)
2. Look for common issues like: too low/high temperature, insufficient max tokens, missing system prompt, knowledge base gaps
3. Provide specific, actionable recommendations
4. Be friendly and encouraging

Common issues to check:
- Temperature too low (< 0.3): Responses may be repetitive
- Temperature too high (> 0.9): Responses may be inconsistent
- Max tokens too low: Responses get cut off
- Missing system prompt: Agent lacks personality/guidance
- Empty knowledge base: Agent can't answer domain-specific questions
- Agent not published: Won't respond to API calls

Format your responses with clear sections and bullet points when helpful.`;

      const response = await supabase.functions.invoke('agent-chat', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ]
        }
      });

      if (response.error) throw response.error;

      // Handle streaming response
      const reader = response.data?.getReader?.();
      if (reader) {
        let fullResponse = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg?.role === 'assistant') {
                      lastMsg.content = fullResponse;
                    } else {
                      newMessages.push({ role: 'assistant', content: fullResponse });
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } else {
        // Non-streaming fallback
        const assistantMessage = response.data?.message || 'I encountered an issue analyzing your problem. Please try again.';
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      }
    } catch (error) {
      console.error('Diagnostics error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while analyzing. Please check your agent configuration and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickDiagnose = async (issue: string) => {
    setInput(issue);
    setTimeout(() => {
      const event = new Event('submit');
      document.getElementById('diagnose-form')?.dispatchEvent(event);
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Quick Diagnostics
          </CardTitle>
          <CardDescription>Click a common issue to get instant help</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickDiagnose("My agent's responses are being cut off mid-sentence")}
            >
              Responses cut off
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickDiagnose("My agent gives inconsistent or random answers")}
            >
              Inconsistent answers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickDiagnose("My agent doesn't respond to API calls")}
            >
              No API response
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickDiagnose("My agent doesn't know about my business/product")}
            >
              Missing knowledge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent Config Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4 text-primary" />
            Configuration Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              {agentConfig.system_prompt ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">System Prompt</span>
            </div>
            <div className="flex items-center gap-2">
              {agentConfig.is_published ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">Published</span>
            </div>
            <div className="flex items-center gap-2">
              {Array.isArray(agentConfig.knowledge_base) && agentConfig.knowledge_base.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">Knowledge Base</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {agentConfig.max_tokens || 1000} tokens
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="flex flex-col h-[400px]">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Ask Helpie
          </CardTitle>
          <CardDescription>Describe your issue and get AI-powered troubleshooting</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Describe the issue you're experiencing with your agent.</p>
                <p className="text-sm mt-1">I'll analyze the configuration and help troubleshoot.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="p-1.5 rounded-full bg-primary/10 h-fit">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg max-w-[80%] text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    </div>
                    {msg.role === 'user' && (
                      <div className="p-1.5 rounded-full bg-secondary h-fit">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-3">
                    <div className="p-1.5 rounded-full bg-primary/10 h-fit">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <form
            id="diagnose-form"
            className="p-4 border-t flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              analyzeProblem();
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the issue you're experiencing..."
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  analyzeProblem();
                }
              }}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
