import { Router, Request, Response } from 'express';
import { supabase } from '../index';
import { authenticateSupabaseJWT, authenticateAPIKey } from '../middleware/auth';
import { z } from 'zod';
import { executeAgent } from '../services/agentExecutor';

export const agentRouter = Router();

// Request validation schema
const agentExecutionSchema = z.object({
  agentId: z.string().uuid(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  stream: z.boolean().optional().default(false)
});

// Execute agent endpoint (supports both JWT and API key auth)
agentRouter.post(
  '/execute',
  async (req: Request, res: Response, next: any) => {
    // Try JWT first, fall back to API key
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authenticateSupabaseJWT(req, res, next);
    }
    return authenticateAPIKey(req, res, next);
  },
  async (req: Request, res: Response) => {
    try {
      console.log('[AGENT-EXECUTE] Request received', {
        agentId: req.body.agentId,
        messageCount: req.body.messages?.length
      });

      // Validate request
      const validation = agentExecutionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors
        });
      }

      const { agentId, messages, stream } = validation.data;
      const userId = (req as any).user.id;

      // Fetch agent configuration
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (agentError || !agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Check if agent is published or belongs to user
      if (!agent.is_published && agent.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      console.log('[AGENT-EXECUTE] Agent loaded', {
        name: agent.name,
        model: agent.ai_model,
        isHeavy: agent.is_heavy
      });

      // Check credit balance
      const { data: creditBalance } = await supabase
        .from('credit_balances')
        .select('credits_remaining')
        .eq('user_id', userId)
        .single();

      if (!creditBalance || creditBalance.credits_remaining <= 0) {
        return res.status(402).json({ 
          error: 'Insufficient credits',
          message: 'Please upgrade your plan or purchase additional credits'
        });
      }

      // Execute agent
      if (stream) {
        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        await executeAgent({
          agent,
          messages,
          userId,
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
        const result = await executeAgent({
          agent,
          messages,
          userId,
          stream: false
        });

        res.json(result);
      }

    } catch (error) {
      console.error('[AGENT-EXECUTE] Error:', error);
      res.status(500).json({
        error: 'Agent execution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get agent metrics endpoint
agentRouter.get(
  '/metrics/:agentId',
  authenticateSupabaseJWT,
  async (req: Request, res: Response) => {
    try {
      const { agentId } = req.params;
      const userId = (req as any).user.id;

      // Verify ownership
      const { data: agent } = await supabase
        .from('agents')
        .select('user_id')
        .eq('id', agentId)
        .single();

      if (!agent || agent.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get usage metrics
      const { data: metrics, error } = await supabase
        .from('credit_usage')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate aggregates
      const totalCredits = metrics?.reduce((sum, m) => sum + m.credits_used, 0) || 0;
      const totalCalls = metrics?.length || 0;

      res.json({
        totalCredits,
        totalCalls,
        recentUsage: metrics
      });

    } catch (error) {
      console.error('[METRICS] Error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  }
);
