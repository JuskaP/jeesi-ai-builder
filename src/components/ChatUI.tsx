import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentPreviewModal, { AgentConfig } from "@/components/AgentPreviewModal";

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: string[];
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  purpose: string;
  category?: string;
  author?: string;
  likes?: number;
}

interface ChatUIProps {
  template?: Template;
}

const formatMessage = (content: string) => {
  return content
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\n\n/g, '\n')
    .trim();
};

export default function ChatUI({ template }: ChatUIProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { trackEvent, trackAgentIssue } = useAnalytics();
  const navigate = useNavigate();
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [currentGreeting, setCurrentGreeting] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<AgentConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max 200px
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const rotatingGreetings = t('landing.greetings.loggedOut', { returnObjects: true }) as string[];

  // Initialize greeting based on user status
  useEffect(() => {
    if (template) {
      const templateMessage = t('landing.greetings.template', {
        name: template.name,
        description: template.description || template.purpose
      });
      setCurrentGreeting(templateMessage);
      setMessages([{ role: "assistant", content: templateMessage }]);
      setHasUserTyped(true);
    } else if (user) {
      const greeting = t('landing.greetings.loggedIn', { 
        email: user.email?.split('@')[0] || ''
      });
      setCurrentGreeting(greeting);
      setMessages([{ role: "assistant", content: greeting }]);
    } else {
      setCurrentGreeting(rotatingGreetings[0]);
      setMessages([{ role: "assistant", content: rotatingGreetings[0] }]);
    }
  }, [user, template, t, i18n.language]);

  // Rotate greetings for non-logged in users
  useEffect(() => {
    if (!user && !hasUserTyped && messages.length === 1) {
      const interval = setInterval(() => {
        setGreetingIndex((prev) => (prev + 1) % rotatingGreetings.length);
      }, 20000);

      return () => clearInterval(interval);
    }
  }, [user, hasUserTyped, messages.length, rotatingGreetings.length]);

  // Update greeting text when index changes
  useEffect(() => {
    if (!user && !hasUserTyped && messages.length === 1) {
      setCurrentGreeting(rotatingGreetings[greetingIndex]);
    }
  }, [greetingIndex, user, hasUserTyped, messages.length, rotatingGreetings]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "nearest",
      inline: "nearest"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: Message | any) => {
    const startTime = Date.now();
    
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`;
      
      const formattedMessages = [...messages, userMessage].map(msg => {
        if (typeof msg.content === 'string') {
          return msg;
        }
        return msg;
      });
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      if (!response.ok || !response.body) {
        // Track error
        trackEvent({
          event_type: 'error',
          error_type: 'stream_failed',
          error_message: `HTTP ${response.status}: Failed to start stream`,
          prompt_text: typeof userMessage.content === 'string' ? userMessage.content : 'image message',
        });
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1) {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      
      if (assistantContent) {
        await saveMessage("assistant", assistantContent);
        
        // Track successful response
        const responseTime = Date.now() - startTime;
        trackEvent({
          event_type: 'response',
          response_time_ms: responseTime,
          response_preview: assistantContent,
          prompt_text: typeof userMessage.content === 'string' ? userMessage.content : 'image message',
          metadata: { message_count: messages.length + 2 },
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Track error event
      trackEvent({
        event_type: 'error',
        error_type: 'chat_error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        prompt_text: typeof userMessage.content === 'string' ? userMessage.content : 'image message',
      });
      
      toast({
        title: t('common.error'),
        description: t('chat.sendError'),
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createOrGetConversation = async () => {
    if (conversationId) return conversationId;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id || null,
          title: t('chat.newConversation')
        })
        .select()
        .single();

      if (error) throw error;
      setConversationId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id || 'anon'}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('agent-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('agent-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const saveMessage = async (role: string, content: string, attachments: string[] = []) => {
    const convId = await createOrGetConversation();
    if (!convId) return;

    try {
      await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          role,
          content,
          attachments
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;
    
    setHasUserTyped(true);
    
    // Track prompt event
    trackEvent({
      event_type: 'prompt',
      prompt_text: input || 'image message',
      metadata: { 
        has_image: !!selectedImage,
        message_count: messages.length + 1,
      },
    });
    
    let userMessage: any;
    let imageUrl: string | null = null;
    
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage);
    }
    
    if (selectedImagePreview) {
      userMessage = {
        role: "user",
        content: [
          { type: "text", text: input || t('chat.analyzeImage') },
          { type: "image_url", image_url: { url: selectedImagePreview } }
        ]
      };
      
      const displayContent = `${input || t('chat.imageSent')} ${t('chat.imageAttached')}`;
      setMessages(prev => [...prev, { 
        role: "user", 
        content: displayContent,
        attachments: imageUrl ? [imageUrl] : []
      }]);
      
      await saveMessage("user", input || t('chat.imageAttached'), imageUrl ? [imageUrl] : []);
    } else {
      userMessage = { role: "user", content: input };
      setMessages(prev => [...prev, userMessage]);
      await saveMessage("user", input);
    }
    
    setInput("");
    setSelectedImage(null);
    setSelectedImagePreview(null);
    setIsLoading(true);

    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const analyzeAndPreview = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create an agent",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (messages.length < 3) {
      toast({
        title: "More details needed",
        description: "Please have a longer conversation so I can understand your requirements better",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-agent', {
        body: { messages, userId: user.id, previewOnly: true }
      });

      if (error) throw error;

      setPreviewConfig(data.config);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Analyze error:', error);
      toast({
        title: "Analysis Failed",
        description: "Couldn't analyze conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confirmCreateAgent = async (config: AgentConfig) => {
    if (!user) return;

    setIsCreatingAgent(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-agent', {
        body: { config, userId: user.id }
      });

      if (error) throw error;

      setShowPreviewModal(false);
      toast({
        title: "Agent Created!",
        description: `${data.agent.name} is ready. Let's configure it together.`
      });

      navigate(`/agents/${data.agent.id}/settings`);
    } catch (error) {
      console.error('Create agent error:', error);
      toast({
        title: "Creation Failed",
        description: "Couldn't create agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAgent(false);
    }
  };

  // Show "Create Agent" button if conversation is substantive
  const showCreateButton = messages.length >= 3 && messages.some(m => m.role === 'user') && !isCreatingAgent && !isAnalyzing;

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-4 rounded-2xl border border-border/20 shadow-lg bg-card/10 backdrop-blur-sm min-h-[200px] max-h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 1 && !hasUserTyped ? (
          <div className="p-4 rounded-xl max-w-[85%] bg-muted text-foreground">
            <div className="whitespace-pre-wrap leading-relaxed text-sm">
              {formatMessage(currentGreeting)}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl max-w-[85%] ${
                m.role === "assistant" 
                  ? "bg-muted text-foreground" 
                  : "bg-primary text-primary-foreground ml-auto"
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed text-sm">
                {formatMessage(m.content)}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('chat.typing')}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-2">
        {showCreateButton && (
          <div className="pb-2">
            <Button
              onClick={analyzeAndPreview}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Conversation...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create This Agent
                </>
              )}
            </Button>
          </div>
        )}

        <AgentPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          config={previewConfig}
          onConfirm={confirmCreateAgent}
          isCreating={isCreatingAgent}
        />

        {selectedImagePreview && (
          <div className="relative inline-block">
            <img src={selectedImagePreview} alt="Preview" className="max-h-32 rounded-lg" />
            <button
              onClick={() => {
                setSelectedImage(null);
                setSelectedImagePreview(null);
              }}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          <textarea
            ref={textareaRef}
            className="flex-1 border border-border/30 rounded-xl p-3 bg-background/50 text-foreground resize-none min-h-[48px] max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50 hover:scrollbar-thumb-border/70"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--border) / 0.5) transparent'
            }}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value.length > 0) setHasUserTyped(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={t('chat.placeholder')}
            disabled={isLoading}
            rows={1}
          />
          
          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
