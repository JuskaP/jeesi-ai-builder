import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    if (!messages || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: messages and userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call Lovable AI to analyze conversation and generate agent config
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const analysisPrompt = `Based on this conversation, extract the agent configuration:

Conversation:
${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}

Analyze the conversation and return the agent configuration in this EXACT format as a tool call. Extract:
- name: A short, clear name for the agent (2-4 words)
- purpose: The main category/use case (e.g., "Customer Service", "Sales", "HR", "Marketing")
- description: A concise 1-2 sentence description of what the agent does
- system_prompt: A detailed prompt that defines the agent's personality, tone, and instructions (200-500 words). Make it specific and actionable.

Important: Create a professional, working agent based on the user's requirements.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an AI agent configuration expert. Extract agent requirements from conversations." },
          { role: "user", content: analysisPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_agent_config",
              description: "Create agent configuration from conversation analysis",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Agent name (2-4 words)" },
                  purpose: { type: "string", description: "Main category (Customer Service, Sales, etc.)" },
                  description: { type: "string", description: "1-2 sentence description" },
                  system_prompt: { type: "string", description: "Detailed agent instructions (200-500 words)" }
                },
                required: ["name", "purpose", "description", "system_prompt"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_agent_config" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to analyze conversation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "Failed to extract agent configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const agentConfig = JSON.parse(toolCall.function.arguments);

    // Create agent in database
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .insert({
        user_id: userId,
        name: agentConfig.name,
        purpose: agentConfig.purpose,
        description: agentConfig.description,
        system_prompt: agentConfig.system_prompt,
        ai_model: "google/gemini-2.5-flash",
        temperature: 0.7,
        max_tokens: 1000,
        status: "draft",
        is_published: false
      })
      .select()
      .single();

    if (agentError) {
      console.error("Error creating agent:", agentError);
      return new Response(
        JSON.stringify({ error: "Failed to create agent" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ agent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Create agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
