import { supabase } from '../index';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AgentExecutionOptions {
  agent: any;
  messages: Message[];
  userId: string;
  stream: boolean;
  onChunk?: (chunk: string) => void;
  onDone?: (result: any) => void;
  onError?: (error: Error) => void;
}

export async function executeAgent(options: AgentExecutionOptions): Promise<any> {
  const { agent, messages, userId, stream, onChunk, onDone, onError } = options;
  const startTime = Date.now();

  try {
    console.log('[AGENT-EXECUTOR] Starting execution', {
      agentId: agent.id,
      model: agent.ai_model,
      messageCount: messages.length
    });

    // Build system prompt
    const systemPrompt = agent.system_prompt || 'You are a helpful AI assistant.';
    
    // Add knowledge base context if available
    let contextPrompt = systemPrompt;
    if (agent.knowledge_base && Array.isArray(agent.knowledge_base) && agent.knowledge_base.length > 0) {
      const knowledgeContext = agent.knowledge_base.map((kb: any) => kb.content).join('\n\n');
      contextPrompt = `${systemPrompt}\n\nKnowledge Base:\n${knowledgeContext}`;
    }

    // Prepare messages for AI model
    const aiMessages = [
      { role: 'system', content: contextPrompt },
      ...messages
    ];

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: agent.ai_model || 'google/gemini-2.5-flash',
        messages: aiMessages,
        temperature: agent.temperature || 0.7,
        max_tokens: agent.max_tokens || 1000,
        stream
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI Gateway error: ${response.status} - ${error}`);
    }

    if (stream && response.body) {
      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content && onChunk) {
              fullResponse += content;
              onChunk(content);
            }
          } catch (e) {
            // Incomplete JSON, keep in buffer
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      const executionTime = Date.now() - startTime;
      const creditsUsed = 1; // Calculate based on token usage if available

      // Record credit usage
      await recordCreditUsage(userId, agent.id, creditsUsed, executionTime);

      if (onDone) {
        onDone({
          response: fullResponse,
          executionTime,
          creditsUsed
        });
      }

      return { response: fullResponse, executionTime, creditsUsed };

    } else {
      // Handle non-streaming response
      const data: any = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || '';

      const executionTime = Date.now() - startTime;
      const creditsUsed = 1;

      // Record credit usage
      await recordCreditUsage(userId, agent.id, creditsUsed, executionTime);

      return {
        response: assistantMessage,
        executionTime,
        creditsUsed
      };
    }

  } catch (error) {
    console.error('[AGENT-EXECUTOR] Error:', error);
    if (onError) {
      onError(error as Error);
    }
    throw error;
  }
}

async function recordCreditUsage(
  userId: string,
  agentId: string,
  creditsUsed: number,
  executionTime: number
): Promise<void> {
  try {
    // Record credit usage
    await supabase
      .from('credit_usage')
      .insert({
        user_id: userId,
        agent_id: agentId,
        credits_used: creditsUsed,
        operation_type: 'agent_execution',
        metadata: { execution_time_ms: executionTime }
      });

    // Update credit balance
    await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_credits: creditsUsed
    });

    console.log('[CREDIT-USAGE] Recorded', {
      userId,
      agentId,
      creditsUsed,
      executionTime
    });
  } catch (error) {
    console.error('[CREDIT-USAGE] Failed to record:', error);
    // Don't throw - don't fail agent execution due to credit recording issues
  }
}
