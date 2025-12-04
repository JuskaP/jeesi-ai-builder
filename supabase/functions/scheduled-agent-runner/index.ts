import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SCHEDULED-RUNNER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    logStep('Starting scheduled agent runner');
    
    const now = new Date().toISOString();
    
    // Fetch all enabled schedules that are due to run
    const { data: dueSchedules, error: fetchError } = await supabaseAdmin
      .from('agent_schedules')
      .select(`
        *,
        agent:agents(*)
      `)
      .eq('is_enabled', true)
      .lte('next_run_at', now);

    if (fetchError) {
      throw new Error(`Failed to fetch schedules: ${fetchError.message}`);
    }

    logStep('Found due schedules', { count: dueSchedules?.length || 0 });

    if (!dueSchedules || dueSchedules.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No schedules due to run',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const schedule of dueSchedules) {
      const agent = schedule.agent;
      if (!agent) {
        logStep('Agent not found for schedule', { scheduleId: schedule.id });
        continue;
      }

      logStep('Processing schedule', { 
        scheduleId: schedule.id, 
        agentId: agent.id,
        agentName: agent.name 
      });

      // Create a run record
      const { data: run, error: runError } = await supabaseAdmin
        .from('scheduled_runs')
        .insert({
          schedule_id: schedule.id,
          agent_id: agent.id,
          user_id: schedule.user_id,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (runError) {
        logStep('Failed to create run record', { error: runError.message });
        continue;
      }

      try {
        // Check user credit balance
        const { data: creditData, error: creditError } = await supabaseAdmin
          .from('credit_balances')
          .select('credits_remaining')
          .eq('user_id', schedule.user_id)
          .single();

        if (creditError || !creditData || creditData.credits_remaining < 1) {
          throw new Error('Insufficient credits');
        }

        // Build system prompt with knowledge base
        let systemPrompt = agent.system_prompt || 'You are a helpful AI assistant.';
        if (agent.knowledge_base && Array.isArray(agent.knowledge_base) && agent.knowledge_base.length > 0) {
          const knowledgeContext = agent.knowledge_base.join('\n\n');
          systemPrompt = `${systemPrompt}\n\nKnowledge Base:\n${knowledgeContext}`;
        }

        // Call Lovable AI Gateway
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (!LOVABLE_API_KEY) {
          throw new Error('LOVABLE_API_KEY not configured');
        }

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: agent.ai_model || 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: schedule.prompt_template }
            ],
            temperature: agent.temperature || 0.7,
            max_tokens: agent.max_tokens || 1000
          })
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          throw new Error(`AI Gateway error: ${aiResponse.status} - ${errorText}`);
        }

        const aiData = await aiResponse.json();
        const generatedContent = aiData.choices?.[0]?.message?.content || '';

        logStep('Content generated', { 
          scheduleId: schedule.id,
          contentLength: generatedContent.length 
        });

        // Handle output action
        let outputResult: Record<string, any> = { success: true };
        
        if (schedule.output_action === 'webhook' && schedule.output_config?.url) {
          try {
            const webhookResponse = await fetch(schedule.output_config.url, {
              method: schedule.output_config.method || 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(schedule.output_config.headers || {})
              },
              body: JSON.stringify({
                agent_id: agent.id,
                agent_name: agent.name,
                content: generatedContent,
                generated_at: new Date().toISOString(),
                ...(schedule.output_config.extra_data || {})
              })
            });
            outputResult = { 
              success: webhookResponse.ok, 
              status: webhookResponse.status 
            };
            logStep('Webhook called', { 
              url: schedule.output_config.url, 
              status: webhookResponse.status 
            });
          } catch (webhookError: any) {
            outputResult = { success: false, error: webhookError.message };
            logStep('Webhook failed', { error: webhookError.message });
          }
        } else if (schedule.output_action === 'api_call' && schedule.output_config?.url) {
          try {
            const apiResponse = await fetch(schedule.output_config.url, {
              method: schedule.output_config.method || 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(schedule.output_config.headers || {})
              },
              body: JSON.stringify({
                title: schedule.output_config.title_template?.replace('{date}', new Date().toLocaleDateString()) || 'Generated Content',
                content: generatedContent,
                status: schedule.output_config.publish_status || 'draft',
                ...(schedule.output_config.extra_fields || {})
              })
            });
            outputResult = { 
              success: apiResponse.ok, 
              status: apiResponse.status 
            };
            logStep('API call completed', { 
              url: schedule.output_config.url, 
              status: apiResponse.status 
            });
          } catch (apiError: any) {
            outputResult = { success: false, error: apiError.message };
            logStep('API call failed', { error: apiError.message });
          }
        }

        // Deduct credits
        await supabaseAdmin.rpc('deduct_credits', {
          p_user_id: schedule.user_id,
          p_credits: 1
        });

        // Log credit usage
        await supabaseAdmin.from('credit_usage').insert({
          user_id: schedule.user_id,
          agent_id: agent.id,
          credits_used: 1,
          operation_type: 'scheduled_run',
          metadata: { schedule_id: schedule.id, run_id: run.id }
        });

        // Calculate next run time
        const { data: nextRunData } = await supabaseAdmin
          .rpc('calculate_next_run', {
            p_cron: schedule.cron_expression,
            p_timezone: schedule.timezone
          });

        // Update schedule
        await supabaseAdmin
          .from('agent_schedules')
          .update({
            last_run_at: new Date().toISOString(),
            next_run_at: nextRunData,
            run_count: schedule.run_count + 1,
            last_result: { success: true, content_length: generatedContent.length },
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id);

        // Update run record as completed
        await supabaseAdmin
          .from('scheduled_runs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            generated_content: generatedContent,
            output_result: outputResult,
            credits_used: 1
          })
          .eq('id', run.id);

        results.push({
          scheduleId: schedule.id,
          agentId: agent.id,
          success: true,
          contentLength: generatedContent.length
        });

      } catch (execError: any) {
        logStep('Execution error', { 
          scheduleId: schedule.id, 
          error: execError.message 
        });

        // Update run as failed
        await supabaseAdmin
          .from('scheduled_runs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: execError.message
          })
          .eq('id', run.id);

        // Update schedule with error
        await supabaseAdmin
          .from('agent_schedules')
          .update({
            last_result: { success: false, error: execError.message },
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id);

        results.push({
          scheduleId: schedule.id,
          agentId: agent.id,
          success: false,
          error: execError.message
        });
      }
    }

    logStep('Scheduled run complete', { 
      processed: results.length,
      successful: results.filter(r => r.success).length 
    });

    return new Response(JSON.stringify({ 
      message: 'Scheduled runs processed',
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    logStep('ERROR', { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
