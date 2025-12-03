import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentId } = await req.json();
    
    if (!messages || !agentId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: messages and agentId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get API key from header
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key and get user
    const keyHash = await hashApiKey(apiKey);
    const { data: apiKeyData, error: keyError } = await supabase
      .from("api_keys")
      .select("user_id, is_active")
      .eq("key_hash", keyHash)
      .eq("is_active", true)
      .single();

    if (keyError || !apiKeyData) {
      console.error("API key validation failed:", keyError);
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = apiKeyData.user_id;

    // Update last_used_at for API key
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("key_hash", keyHash);

    // Check credit balance
    const { data: creditData, error: creditError } = await supabase
      .from("credit_balances")
      .select("credits_remaining, plan_type")
      .eq("user_id", userId)
      .single();

    if (creditError || !creditData || creditData.credits_remaining <= 0) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch agent configuration
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, name, system_prompt, ai_model, temperature, max_tokens, is_published, user_id, is_heavy, railway_url, knowledge_base")
      .eq("id", agentId)
      .eq("is_published", true)
      .single();

    if (agentError || !agent) {
      console.error("Agent fetch failed:", agentError);
      return new Response(
        JSON.stringify({ error: "Agent not found or not published" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ROUTING LOGIC: Check if agent is heavy and should run on Railway
    if (agent.is_heavy) {
      const railwayUrl = agent.railway_url || Deno.env.get("RAILWAY_BACKEND_URL");
      const railwaySecret = Deno.env.get("RAILWAY_BACKEND_SECRET");
      
      if (!railwayUrl) {
        console.error("Heavy agent but no Railway URL configured");
        return new Response(
          JSON.stringify({ error: "Heavy agent execution not configured" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!railwaySecret) {
        console.error("RAILWAY_BACKEND_SECRET not configured");
        return new Response(
          JSON.stringify({ error: "Railway authentication not configured" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[AGENT-RUNTIME] Routing to Railway backend", { agentId, railwayUrl });

      // Forward PRE-VALIDATED request to Railway backend with shared secret
      const railwayResponse = await fetch(`${railwayUrl}/api/agent/execute-validated`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-railway-secret": railwaySecret
        },
        body: JSON.stringify({
          // Pre-validated data - Railway trusts this
          userId,
          agentId: agent.id,
          agentConfig: {
            name: agent.name,
            system_prompt: agent.system_prompt,
            ai_model: agent.ai_model || "google/gemini-2.5-flash",
            temperature: agent.temperature || 0.7,
            max_tokens: agent.max_tokens || 1000,
            knowledge_base: agent.knowledge_base
          },
          messages,
          stream: true
        })
      });

      if (!railwayResponse.ok) {
        const errorText = await railwayResponse.text();
        console.error("[AGENT-RUNTIME] Railway backend error:", railwayResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "Railway backend error", details: errorText }),
          { status: railwayResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Deduct credits after successful Railway execution start
      await deductCredits(supabase, userId, agentId, agent.ai_model, messages.length);

      // Stream Railway response back to client
      return new Response(railwayResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
        },
      });
    }

    // STANDARD PATH: Execute agent locally in edge function
    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build system prompt with knowledge base
    let systemPrompt = agent.system_prompt || "You are a helpful AI assistant.";
    if (agent.knowledge_base && Array.isArray(agent.knowledge_base) && agent.knowledge_base.length > 0) {
      const knowledgeContext = agent.knowledge_base.map((kb: any) => kb.content).join("\n\n");
      systemPrompt = `${systemPrompt}\n\nKnowledge Base:\n${knowledgeContext}`;
    }

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: agent.ai_model || "google/gemini-2.5-flash",
        messages: aiMessages,
        temperature: agent.temperature || 0.7,
        max_tokens: agent.max_tokens || 1000,
        stream: true,
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
        JSON.stringify({ error: "AI Gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduct credits after successful AI Gateway call
    await deductCredits(supabase, userId, agentId, agent.ai_model, messages.length);

    // Stream response back to client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });

  } catch (error) {
    console.error("Agent runtime error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to deduct credits properly
async function deductCredits(
  supabase: any, 
  userId: string, 
  agentId: string, 
  model: string | null, 
  messageCount: number
): Promise<void> {
  const creditsUsed = 1;
  
  try {
    // Use the deduct_credits RPC function
    await supabase.rpc("deduct_credits", {
      p_user_id: userId,
      p_credits: creditsUsed
    });

    // Log usage
    await supabase
      .from("credit_usage")
      .insert({
        user_id: userId,
        agent_id: agentId,
        credits_used: creditsUsed,
        operation_type: "agent_runtime",
        metadata: {
          model: model || "google/gemini-2.5-flash",
          message_count: messageCount
        }
      });

    console.log("[AGENT-RUNTIME] Credits deducted", { userId, agentId, creditsUsed });
  } catch (error) {
    console.error("[AGENT-RUNTIME] Failed to deduct credits:", error);
    // Don't fail the request due to credit deduction issues
  }
}

// Helper function to hash API key
async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
