import React, { useState } from "react";

export default function ChatUI() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hei! Mitä haluaisit luoda tänään?" }
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { role: "user", content: input };
    setMessages([...messages, newMsg]);
    setInput("");

    // Placeholder assistant logic
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "Kiitos! Aloitetaan agentin luonti." }]);
    }, 400);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto p-4 rounded-2xl border border-border shadow-lg bg-card h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[80%] ${
              m.role === "assistant" 
                ? "bg-muted text-foreground" 
                : "bg-primary text-primary-foreground ml-auto"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          className="flex-1 border border-border rounded-xl p-3 bg-background text-foreground"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Kerro, millaisen agentin haluat..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
        >
          Lähetä
        </button>
      </div>
    </div>
  );
}
