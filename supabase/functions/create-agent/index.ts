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
    const { messages, userId, previewOnly, config } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If config is provided, create agent directly (confirmation step)
    if (config && userId) {
      // Check credit balance before creating
      const { data: balance } = await supabase
        .from('credit_balances')
        .select('credits_remaining')
        .eq('user_id', userId)
        .single();
      
      if (balance && balance.credits_remaining < 2) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits. Creating an agent costs 2 credits.' }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .insert({
          user_id: userId,
          name: config.name,
          purpose: config.purpose,
          description: config.description,
          system_prompt: config.system_prompt,
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

      // Deduct 2 credits for agent creation
      await supabase.rpc('deduct_credits', { p_user_id: userId, p_credits: 2 });
      
      // Log credit usage
      await supabase.from('credit_usage').insert({
        user_id: userId,
        credits_used: 2,
        operation_type: 'agent_creation',
        agent_id: agent.id,
        metadata: { agent_name: config.name }
      });
      
      console.log('Agent created and 2 credits deducted for user', userId);

      return new Response(
        JSON.stringify({ agent }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!messages || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: messages and userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check credit balance before analysis
    const { data: balance } = await supabase
      .from('credit_balances')
      .select('credits_remaining')
      .eq('user_id', userId)
      .single();
    
    if (balance && balance.credits_remaining < 1) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits for agent analysis.' }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lovable AI to analyze conversation and generate agent config
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const analysisPrompt = `Based on this conversation, extract the agent configuration:

Conversation:
${messages.map((m: any) => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n')}

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

    // Deduct 1 credit for preview/analysis
    await supabase.rpc('deduct_credits', { p_user_id: userId, p_credits: 1 });
    
    // Log credit usage for analysis
    await supabase.from('credit_usage').insert({
      user_id: userId,
      credits_used: 1,
      operation_type: 'agent_analysis',
      metadata: { preview_only: previewOnly }
    });
    
    console.log('Analysis complete, 1 credit deducted for user', userId);

    // If previewOnly, return config without creating agent
    if (previewOnly) {
      console.log("Returning preview config:", agentConfig);
      return new Response(
        JSON.stringify({ config: agentConfig }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has enough credits to also create the agent (2 more)
    const { data: updatedBalance } = await supabase
      .from('credit_balances')
      .select('credits_remaining')
      .eq('user_id', userId)
      .single();
    
    if (updatedBalance && updatedBalance.credits_remaining < 2) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits to create agent. Need 2 more credits.' }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Deduct 2 credits for agent creation
    await supabase.rpc('deduct_credits', { p_user_id: userId, p_credits: 2 });
    
    // Log credit usage
    await supabase.from('credit_usage').insert({
      user_id: userId,
      credits_used: 2,
      operation_type: 'agent_creation',
      agent_id: agent.id,
      metadata: { agent_name: agentConfig.name }
    });
    
    console.log('Agent created and 2 credits deducted for user', userId);

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
