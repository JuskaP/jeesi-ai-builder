import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

interface AgentFunction {
  id: string;
  name: string;
  function_type: string;
  trigger_keywords: string[];
  config: Record<string, any>;
  is_enabled: boolean;
  execution_order: number;
}

interface FunctionResult {
  functionName: string;
  functionType: string;
  success: boolean;
  data?: any;
  error?: string;
}

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

    // Fetch custom functions for this agent
    const { data: agentFunctions, error: functionsError } = await supabase
      .from("agent_functions")
      .select("*")
      .eq("agent_id", agentId)
      .eq("is_enabled", true)
      .order("execution_order");

    if (functionsError) {
      console.error("Failed to fetch agent functions:", functionsError);
    }

    const functions: AgentFunction[] = agentFunctions || [];
    console.log(`[AGENT-RUNTIME] Loaded ${functions.length} custom functions for agent ${agentId}`);

    // Get the last user message to check for triggers
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userContent = lastUserMessage?.content?.toLowerCase() || "";

    // Execute triggered functions
    const functionResults: FunctionResult[] = [];
    const triggeredFunctions = functions.filter(fn => 
      fn.trigger_keywords.some(keyword => userContent.includes(keyword.toLowerCase()))
    );

    console.log(`[AGENT-RUNTIME] ${triggeredFunctions.length} functions triggered by keywords`);

    for (const fn of triggeredFunctions) {
      try {
        const result = await executeFunction(fn, userContent, messages);
        functionResults.push(result);
        console.log(`[AGENT-RUNTIME] Function ${fn.name} executed:`, result.success);
      } catch (error) {
        console.error(`[AGENT-RUNTIME] Function ${fn.name} failed:`, error);
        functionResults.push({
          functionName: fn.name,
          functionType: fn.function_type,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    // Check for conditional responses that should override AI response
    const conditionalResult = functionResults.find(
      r => r.functionType === "conditional" && r.success && r.data?.response
    );

    if (conditionalResult) {
      // Return conditional response directly without calling AI
      console.log(`[AGENT-RUNTIME] Returning conditional response`);
      await deductCredits(supabase, userId, agentId, agent.ai_model, messages.length);
      
      // Execute webhooks in background
      executeWebhooksInBackground(functions, messages, conditionalResult.data.response, supabase, agentId);
      
      return streamDirectResponse(conditionalResult.data.response, corsHeaders);
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
          functionResults, // Pass function results to Railway
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

      await deductCredits(supabase, userId, agentId, agent.ai_model, messages.length);

      return new Response(railwayResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
        },
      });
    }

    // STANDARD PATH: Execute agent locally in edge function
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build system prompt with knowledge base and function results
    let systemPrompt = agent.system_prompt || "You are a helpful AI assistant.";
    
    // Add knowledge base context
    if (agent.knowledge_base && Array.isArray(agent.knowledge_base) && agent.knowledge_base.length > 0) {
      const knowledgeContext = agent.knowledge_base.map((kb: any) => kb.content).join("\n\n");
      systemPrompt = `${systemPrompt}\n\nKnowledge Base:\n${knowledgeContext}`;
    }

    // Add function results context if any functions were executed
    if (functionResults.length > 0) {
      const successfulResults = functionResults.filter(r => r.success && r.data);
      if (successfulResults.length > 0) {
        const functionContext = successfulResults.map(r => {
          if (r.functionType === "api_call" && r.data) {
            return `[API Result from ${r.functionName}]: ${JSON.stringify(r.data).substring(0, 500)}`;
          }
          if (r.functionType === "data_transform" && r.data) {
            return `[Transformed Data from ${r.functionName}]: ${r.data}`;
          }
          return "";
        }).filter(Boolean).join("\n");
        
        if (functionContext) {
          systemPrompt = `${systemPrompt}\n\nExternal Data (use this in your response when relevant):\n${functionContext}`;
        }
      }
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

    await deductCredits(supabase, userId, agentId, agent.ai_model, messages.length);

    // Execute webhooks in background after response starts streaming
    executeWebhooksInBackground(functions, messages, null, supabase, agentId);

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

// Execute a custom function based on its type
async function executeFunction(fn: AgentFunction, userContent: string, messages: any[]): Promise<FunctionResult> {
  const baseResult = {
    functionName: fn.name,
    functionType: fn.function_type,
  };

  switch (fn.function_type) {
    case "api_call":
      return await executeApiCall(fn, userContent, baseResult);
    
    case "conditional":
      return executeConditional(fn, userContent, baseResult);
    
    case "data_transform":
      return executeDataTransform(fn, userContent, messages, baseResult);
    
    case "webhook":
      // Webhooks are executed in background, not blocking
      return { ...baseResult, success: true, data: { scheduled: true } };
    
    default:
      return { ...baseResult, success: false, error: "Unknown function type" };
  }
}

// Execute API call function
async function executeApiCall(fn: AgentFunction, userContent: string, baseResult: any): Promise<FunctionResult> {
  const config = fn.config;
  const url = config.url as string;
  const method = (config.method as string) || "GET";
  
  if (!url) {
    return { ...baseResult, success: false, error: "No URL configured" };
  }

  try {
    // Parse headers
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    if (config.headers_json) {
      try {
        headers = { ...headers, ...JSON.parse(config.headers_json as string) };
      } catch {
        console.error("Failed to parse headers JSON");
      }
    }

    // Prepare body with template substitution
    let body: string | undefined;
    if (config.body_template && method !== "GET") {
      body = (config.body_template as string).replace(/\{\{user_input\}\}/g, userContent);
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body) {
      fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      return { 
        ...baseResult, 
        success: false, 
        error: `API returned ${response.status}` 
      };
    }

    const data = await response.json();
    return { ...baseResult, success: true, data };
  } catch (error) {
    return { 
      ...baseResult, 
      success: false, 
      error: error instanceof Error ? error.message : "API call failed" 
    };
  }
}

// Execute conditional response function
function executeConditional(fn: AgentFunction, userContent: string, baseResult: any): FunctionResult {
  const config = fn.config;
  
  // Check if any condition keyword matches
  const conditionKeyword = (config.condition_keyword as string)?.toLowerCase() || "";
  const keywords = conditionKeyword.split(",").map(k => k.trim()).filter(Boolean);
  
  const matched = keywords.some(keyword => userContent.includes(keyword));
  
  if (matched && config.condition_response) {
    return {
      ...baseResult,
      success: true,
      data: { response: config.condition_response as string, matched: true }
    };
  }
  
  // Return default response if configured and no match
  if (config.default_response && !matched) {
    return {
      ...baseResult,
      success: true,
      data: { response: config.default_response as string, matched: false }
    };
  }
  
  return { ...baseResult, success: false, data: { matched: false } };
}

// Execute data transform function
function executeDataTransform(fn: AgentFunction, userContent: string, messages: any[], baseResult: any): FunctionResult {
  const config = fn.config;
  const transformType = config.transform_type as string;
  const template = config.template as string;
  
  try {
    let result: string;
    
    switch (transformType) {
      case "format":
        result = template?.replace(/\{\{data\}\}/g, userContent) || userContent;
        break;
      case "extract":
        // Simple extraction - just pass through for now
        result = userContent;
        break;
      case "summarize":
        // Will be handled by AI with the context
        result = `Please summarize: ${userContent}`;
        break;
      default:
        result = userContent;
    }
    
    return { ...baseResult, success: true, data: result };
  } catch (error) {
    return { ...baseResult, success: false, error: "Transform failed" };
  }
}

// Execute webhooks in background
function executeWebhooksInBackground(
  functions: AgentFunction[], 
  messages: any[], 
  response: string | null,
  supabase: any,
  agentId: string
) {
  const webhooks = functions.filter(fn => fn.function_type === "webhook");
  
  if (webhooks.length === 0) return;

  const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
  
  // Use EdgeRuntime.waitUntil if available
  const executeWebhooks = async () => {
    for (const webhook of webhooks) {
      try {
        const config = webhook.config;
        const webhookUrl = config.webhook_url as string;
        const triggerEvent = config.trigger_event as string;
        
        if (!webhookUrl) continue;
        
        // Check trigger event
        if (triggerEvent === "on_keyword") {
          const keywords = webhook.trigger_keywords;
          const content = lastUserMessage?.content?.toLowerCase() || "";
          const triggered = keywords.some(k => content.includes(k.toLowerCase()));
          if (!triggered) continue;
        }
        
        // Prepare payload
        let payload: Record<string, any> = {
          agent_id: agentId,
          timestamp: new Date().toISOString(),
          message: lastUserMessage?.content || "",
          response: response || "",
        };
        
        if (config.payload_template) {
          try {
            let templateStr = config.payload_template as string;
            templateStr = templateStr
              .replace(/\{\{content\}\}/g, lastUserMessage?.content || "")
              .replace(/\{\{response\}\}/g, response || "")
              .replace(/\{\{agent_id\}\}/g, agentId);
            payload = JSON.parse(templateStr);
          } catch {
            // Use default payload if template parsing fails
          }
        }
        
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        console.log(`[AGENT-RUNTIME] Webhook ${webhook.name} executed`);
      } catch (error) {
        console.error(`[AGENT-RUNTIME] Webhook ${webhook.name} failed:`, error);
      }
    }
  };

  // Execute without blocking
  executeWebhooks().catch(console.error);
}

// Stream a direct response (for conditional responses)
function streamDirectResponse(content: string, corsHeaders: Record<string, string>): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send as SSE format compatible with frontend
      const chunk = {
        choices: [{
          delta: { content },
          index: 0
        }]
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
    },
  });
}

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
    await supabase.rpc("deduct_credits", {
      p_user_id: userId,
      p_credits: creditsUsed
    });

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
