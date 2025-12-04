import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentConfig } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client for credit management
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    console.log('Processing agent chat request with', messages.length, 'messages', userId ? `for user ${userId}` : '(anonymous)');
    
    // Check credit balance if user is authenticated
    if (userId) {
      const { data: balance } = await supabase
        .from('credit_balances')
        .select('credits_remaining')
        .eq('user_id', userId)
        .single();
      
      if (balance && balance.credits_remaining <= 0) {
        return new Response(
          JSON.stringify({ error: 'No credits remaining. Please upgrade your plan or purchase credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Check if any message contains images
    const hasImages = messages.some((msg: any) => 
      Array.isArray(msg.content) && 
      msg.content.some((part: any) => part.type === 'image_url')
    );
    
    if (hasImages) {
      console.log('Request contains images - using multimodal capabilities');
    }

    // Use custom agent config if provided (test mode), otherwise use default Helpie config
    const systemPrompt = agentConfig?.system_prompt || `You are Helpie, an AI agent builder assistant that helps businesses design and define AI agents.

IMPORTANT INSTRUCTION - Conversation structure:
- Ask ONLY 1-2 clarifying questions at a time
- Keep questions short and clear
- When the customer responds, suggest 2-3 concrete alternatives or new perspectives
- Build the conversation step by step, not all at once

CONVERSATION PHASES:
1. Start: Ask what the customer wants to create (1 question)
2. Clarification: When customer responds, ask about one important detail and suggest 2-3 ways the agent could work
3. Features: Suggest concrete features based on the customer's description
4. Summary: Collect information together and suggest next steps

IMAGE ANALYSIS:
- If the customer sends an image, analyze it carefully
- Identify elements from the image that can help design the agent (e.g. products, services, user interfaces, processes)
- Suggest concrete ways how an AI agent could utilize the image content
- Ask clarifying questions about the image context

EXAMPLE OF A GOOD RESPONSE:
User: "I would like a customer service bot"
You: "Great! Which channel do you primarily need the bot for?

The bot could, for example:
- Answer the most common questions 24/7 and direct more complex matters to a human
- Help with order tracking and updating basic information
- Collect customer feedback and categorize inquiries"

Be friendly, encouraging, and use clear language without technical jargon.`;

    const model = agentConfig?.ai_model || 'google/gemini-2.5-flash';
    const temperature = agentConfig?.temperature || 0.7;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Deduct 1 credit for successful Helpie chat if user is authenticated
    if (userId) {
      await supabase.rpc('deduct_credits', { p_user_id: userId, p_credits: 1 });
      
      // Log credit usage
      await supabase.from('credit_usage').insert({
        user_id: userId,
        credits_used: 1,
        operation_type: 'helpie_chat',
        metadata: { messages_count: messages.length, has_images: hasImages }
      });
      
      console.log('Deducted 1 credit for user', userId);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Agent conversation error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
