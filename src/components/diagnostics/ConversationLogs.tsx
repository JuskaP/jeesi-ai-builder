import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MessageSquare, ChevronDown, ChevronRight, User, Bot, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  messages: Message[];
}

interface ConversationLogsProps {
  agentId: string;
}

export default function ConversationLogs({ agentId }: ConversationLogsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [agentId]);

  const fetchConversations = async () => {
    try {
      // Fetch conversations for this agent
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (convError) throw convError;

      // Fetch messages for each conversation
      const conversationsWithMessages: Conversation[] = [];
      
      for (const conv of convData || []) {
        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });

        conversationsWithMessages.push({
          ...conv,
          messages: msgData || []
        });
      }

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading conversation logs...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="text-sm mt-1">
              Conversations will appear here once users start interacting with your agent.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
        <Button variant="outline" size="sm" onClick={fetchConversations}>
          Refresh
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {conversations.map((conv) => (
            <Collapsible
              key={conv.id}
              open={expandedId === conv.id}
              onOpenChange={(open) => setExpandedId(open ? conv.id : null)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedId === conv.id ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <div>
                          <CardTitle className="text-sm">
                            {conv.title || `Conversation ${conv.id.slice(0, 8)}`}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(conv.created_at), 'MMM d, yyyy HH:mm')}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3 border-t pt-4">
                      {conv.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${
                            msg.role === 'user' ? '' : 'flex-row-reverse'
                          }`}
                        >
                          <div
                            className={`flex items-start gap-2 max-w-[80%] ${
                              msg.role === 'user' ? '' : 'flex-row-reverse'
                            }`}
                          >
                            <div
                              className={`p-1.5 rounded-full ${
                                msg.role === 'user'
                                  ? 'bg-primary/10'
                                  : 'bg-secondary'
                              }`}
                            >
                              {msg.role === 'user' ? (
                                <User className="h-3 w-3 text-primary" />
                              ) : (
                                <Bot className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            <div
                              className={`p-3 rounded-lg text-sm ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
