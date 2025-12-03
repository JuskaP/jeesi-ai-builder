interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AgentConfig {
  name?: string;
  system_prompt?: string | null;
  ai_model?: string;
  temperature?: number;
  max_tokens?: number;
  knowledge_base?: any;
}

interface AgentExecutionOptions {
  agentId: string;
  agentConfig: AgentConfig;
  messages: Message[];
  stream: boolean;
  onChunk?: (chunk: string) => void;
  onDone?: (result: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Execute agent with pre-validated configuration
 * This function trusts the data from edge function - no Supabase calls needed
 * Credit deduction is handled by the edge function AFTER this returns
 */
export async function executeAgentValidated(options: AgentExecutionOptions): Promise<any> {
  const { agentId, agentConfig, messages, stream, onChunk, onDone, onError } = options;
  const startTime = Date.now();

  try {
    console.log('[AGENT-EXECUTOR] Starting execution', {
      agentId,
      model: agentConfig.ai_model,
      messageCount: messages.length
    });

    // Build system prompt with knowledge base
    let systemPrompt = agentConfig.system_prompt || 'You are a helpful AI assistant.';
    
    if (agentConfig.knowledge_base && Array.isArray(agentConfig.knowledge_base) && agentConfig.knowledge_base.length > 0) {
      const knowledgeContext = agentConfig.knowledge_base.map((kb: any) => kb.content).join('\n\n');
      systemPrompt = `${systemPrompt}\n\nKnowledge Base:\n${knowledgeContext}`;
    }

    // Prepare messages for AI model
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured on Railway');
    }

    console.log('[AGENT-EXECUTOR] Calling AI Gateway', {
      model: agentConfig.ai_model,
      temperature: agentConfig.temperature,
      maxTokens: agentConfig.max_tokens
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: agentConfig.ai_model || 'google/gemini-2.5-flash',
        messages: aiMessages,
        temperature: agentConfig.temperature || 0.7,
        max_tokens: agentConfig.max_tokens || 1000,
        stream
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AGENT-EXECUTOR] AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
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
      console.log('[AGENT-EXECUTOR] Streaming complete', { agentId, executionTime });

      if (onDone) {
        onDone({
          response: fullResponse,
          executionTime
        });
      }

      return { response: fullResponse, executionTime };

    } else {
      // Handle non-streaming response
      const data: any = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || '';
      const executionTime = Date.now() - startTime;

      console.log('[AGENT-EXECUTOR] Non-streaming complete', { agentId, executionTime });

      return {
        response: assistantMessage,
        executionTime
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
