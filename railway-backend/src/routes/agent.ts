import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { executeAgentValidated } from '../services/agentExecutor';
import { verifyRailwaySecret } from '../middleware/auth';

export const agentRouter = Router();

// Schema for pre-validated execution requests from edge function
const validatedExecutionSchema = z.object({
  userId: z.string().uuid(),
  agentId: z.string().uuid(),
  agentConfig: z.object({
    name: z.string().optional(),
    system_prompt: z.string().nullable().optional(),
    ai_model: z.string().optional().default('google/gemini-2.5-flash'),
    temperature: z.number().min(0).max(1).optional().default(0.7),
    max_tokens: z.number().min(100).max(4000).optional().default(1000),
    knowledge_base: z.any().nullable().optional()
  }),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  stream: z.boolean().optional().default(true)
});

/**
 * Execute pre-validated agent endpoint
 * This endpoint is called by the agent-runtime edge function with pre-validated data
 * Railway only verifies the shared secret - all validation happens in edge function
 */
agentRouter.post(
  '/execute-validated',
  verifyRailwaySecret,
  async (req: Request, res: Response) => {
    try {
      console.log('[AGENT-EXECUTE-VALIDATED] Request received from edge function');

      // Validate request structure (data is already trusted from edge function)
      const validation = validatedExecutionSchema.safeParse(req.body);
      if (!validation.success) {
        console.error('[AGENT-EXECUTE-VALIDATED] Invalid request structure:', validation.error.errors);
        return res.status(400).json({
          error: 'Invalid request structure',
          details: validation.error.errors
        });
      }

      const { userId, agentId, agentConfig, messages, stream } = validation.data;

      console.log('[AGENT-EXECUTE-VALIDATED] Processing', {
        userId,
        agentId,
        model: agentConfig.ai_model,
        messageCount: messages.length
      });

      if (stream) {
        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        await executeAgentValidated({
          agentId,
          agentConfig,
          messages,
          stream: true,
          onChunk: (chunk: string) => {
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
          },
          onDone: (result: any) => {
            res.write(`data: ${JSON.stringify({ type: 'done', ...result })}\n\n`);
            res.end();
          },
          onError: (error: Error) => {
            res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
            res.end();
          }
        });
      } else {
        // Non-streaming response
        const result = await executeAgentValidated({
          agentId,
          agentConfig,
          messages,
          stream: false
        });

        res.json(result);
      }

    } catch (error) {
      console.error('[AGENT-EXECUTE-VALIDATED] Error:', error);
      res.status(500).json({
        error: 'Agent execution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Health check for Railway
agentRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'agent-executor' });
});
