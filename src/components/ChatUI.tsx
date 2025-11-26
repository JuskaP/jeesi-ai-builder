import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Image as ImageIcon, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  likes: number;
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

const rotatingGreetings = [
  "Hei! Mitä AI-agenttia haluaisit rakentaa tänään? 🤖",
  "Terve! Kuvaile unelmiesi agentti, niin minä rakennan sen! ✨",
  "Moi! Kerro mitä haluat automatisoida, minä hoidan loput! 🚀",
  "Hei taas! Luodaan yhdessä jotain mahtavaa? 💡",
  "Tervehdys! Valmis tekemään AI:sta helppoa? 🎯",
  "Moikka! Jeesi.io vie ideasi todellisuudeksi minuuteissa! ⚡"
];

export default function ChatUI({ template }: ChatUIProps) {
  const { user } = useAuth();
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [initialGreeting, setInitialGreeting] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize greeting based on user status
  useEffect(() => {
    if (template) {
      const templateMessage = `Loistavaa! Aloitetaan "${template.name}" -agentin muokkaus. ${template.description}\n\nKerro tarkemmin, mitä haluat tämän agentin tekevän ja miten se palvelee tarpeitasi?`;
      setInitialGreeting(templateMessage);
      setMessages([{ role: "assistant", content: templateMessage }]);
      setHasUserTyped(true);
    } else if (user) {
      const greeting = `Hei ${user.email?.split('@')[0] || 'siellä'}! Mitä haluaisit luoda tänään? 🎉`;
      setInitialGreeting(greeting);
      setMessages([{ role: "assistant", content: greeting }]);
    } else {
      setInitialGreeting(rotatingGreetings[0]);
      setMessages([{ role: "assistant", content: rotatingGreetings[0] }]);
    }
  }, [user, template]);

  // Rotate greetings for non-logged in users
  useEffect(() => {
    if (!user && !hasUserTyped && messages.length === 1) {
      const interval = setInterval(() => {
        setGreetingIndex((prev) => {
          const nextIndex = (prev + 1) % rotatingGreetings.length;
          setMessages([{ role: "assistant", content: rotatingGreetings[nextIndex] }]);
          return nextIndex;
        });
      }, 20000);

      return () => clearInterval(interval);
    }
  }, [user, hasUserTyped, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: Message | any) => {
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`;
      
      // Build messages array with proper format for images
      const formattedMessages = [...messages, userMessage].map(msg => {
        if (typeof msg.content === 'string') {
          return msg;
        }
        // Message with image
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
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Virhe",
        description: "Viestien lähetyksessä tapahtui virhe. Yritä uudelleen.",
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            const { data, error } = await supabase.functions.invoke('transcribe-audio', {
              body: { audio: base64Audio }
            });

            if (error) throw error;
            
            if (data?.text) {
              setInput(data.text);
              toast({
                title: "Puhe tunnistettu",
                description: "Voit nyt lähettää viestin.",
              });
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast({
              title: "Virhe",
              description: "Puheen tunnistamisessa tapahtui virhe.",
              variant: "destructive",
            });
          }
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Virhe",
        description: "Mikrofonin käyttö epäonnistui.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;
    
    setHasUserTyped(true);
    
    let userMessage: any;
    
    if (selectedImage) {
      // Message with image
      userMessage = {
        role: "user",
        content: [
          { type: "text", text: input || "Analysoi tämä kuva agentin luontia varten." },
          { type: "image_url", image_url: { url: selectedImage } }
        ]
      };
      
      // For display purposes, create a simple text version
      setMessages(prev => [...prev, { 
        role: "user", 
        content: `${input || "Lähetin kuvan"} [Kuva liitetty]` 
      }]);
    } else {
      userMessage = { role: "user", content: input };
      setMessages(prev => [...prev, userMessage]);
    }
    
    setInput("");
    setSelectedImage(null);
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

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-4 rounded-2xl border border-border/20 shadow-lg bg-card/10 backdrop-blur-sm min-h-[200px] max-h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((m, i) => (
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
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Kirjoittaa...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-2">
        {selectedImage && (
          <div className="relative inline-block">
            <img src={selectedImage} alt="Preview" className="max-h-32 rounded-lg" />
            <button
              onClick={() => setSelectedImage(null)}
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
          
          <Button
            type="button"
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <input
            className="flex-1 border border-border rounded-xl p-3 bg-background text-foreground"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value.length > 0) setHasUserTyped(true);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Kerro, millaisen agentin haluat..."
            disabled={isLoading}
          />
          
          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lähetä
          </button>
        </div>
      </div>
    </div>
  );
}
