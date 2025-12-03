import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Agent {
  id: string;
  name: string;
  description: string | null;
}

export default function PublicChat() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const apiKey = searchParams.get("key");
  const theme = searchParams.get("theme") || "light";
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  useEffect(() => {
    if (id) {
      fetchAgent();
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const fetchAgent = async () => {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("id, name, description")
        .eq("id", id)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      setAgent(data);
    } catch (err) {
      setError("Agent not found or not available.");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setStreamingContent("");

    try {
      const response = await fetch(
        `https://kyysnciirgauhzzqobly.supabase.co/functions/v1/agent-runtime`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            agentId: id,
            messages: [...messages, { role: "user", content: userMessage }],
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error: ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && response.body) {
        // Handle SSE streaming
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line || line.startsWith(":")) continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.type === "chunk" && data.content) {
                fullResponse += data.content;
                setStreamingContent(fullResponse);
              } else if (data.type === "done") {
                setMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: fullResponse },
                ]);
                setStreamingContent("");
              } else if (data.type === "error") {
                throw new Error(data.error || "An error occurred");
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }

        // Finalize if stream ended without done event
        if (fullResponse && !messages.find((m) => m.content === fullResponse)) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: fullResponse },
          ]);
          setStreamingContent("");
        }
      } else {
        // Handle non-streaming JSON response
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response || "No response" },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "An error occurred",
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <p>{error}</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-white"
        }`}
      >
        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? "text-white" : "text-gray-900"}`} />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <p>Missing API key. Please provide a valid key parameter.</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDark ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 border-b ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        }`}
      >
        <h1
          className={`font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {agent.name}
        </h1>
        {agent.description && (
          <p
            className={`text-sm ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {agent.description}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div
            className={`text-center py-8 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <p>Start a conversation with {agent.name}</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : isDark
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {streamingContent && (
          <div className="flex justify-start">
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap">{streamingContent}</p>
            </div>
          </div>
        )}

        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div
              className={`px-4 py-2 rounded-lg ${
                isDark ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <Loader2 className={`w-5 h-5 animate-spin ${isDark ? "text-white" : "text-gray-900"}`} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className={`p-4 border-t ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className={
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                : ""
            }
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
