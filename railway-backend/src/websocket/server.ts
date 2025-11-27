import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { supabase } from '../index';

export function websocketServer(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws'
  });

  console.log('🔌 WebSocket server initialized on /ws');

  wss.on('connection', async (ws: WebSocket, req) => {
    console.log('[WS] New connection attempt');

    try {
      // Extract token from query string
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Missing authentication token');
        return;
      }

      // Verify JWT
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('SUPABASE_JWT_SECRET not configured');
      }

      const decoded = jwt.verify(token, jwtSecret) as { sub: string; email: string };
      const userId = decoded.sub;

      console.log('[WS] Authenticated connection', { userId });

      // Store user info on WebSocket instance
      (ws as any).userId = userId;

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established',
        userId
      }));

      // Handle incoming messages
      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('[WS] Message received', { type: message.type, userId });

          // Handle different message types
          switch (message.type) {
            case 'agent_execute':
              await handleAgentExecution(ws, userId, message);
              break;
            
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
              break;

            default:
              ws.send(JSON.stringify({
                type: 'error',
                error: `Unknown message type: ${message.type}`
              }));
          }

        } catch (error) {
          console.error('[WS] Message handling error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Message handling failed'
          }));
        }
      });

      // Handle disconnection
      ws.on('close', (code, reason) => {
        console.log('[WS] Connection closed', { userId, code, reason: reason.toString() });
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('[WS] WebSocket error:', error);
      });

    } catch (error) {
      console.error('[WS] Authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  // Periodic cleanup of dead connections
  setInterval(() => {
    wss.clients.forEach((ws) => {
      const client = ws as WebSocket & { isAlive?: boolean };
      if (!client.isAlive) {
        client.terminate();
        return;
      }
      client.isAlive = false;
      client.ping();
    });
  }, 30000);
}

async function handleAgentExecution(ws: WebSocket, userId: string, message: any) {
  try {
    const { agentId, messages } = message;

    if (!agentId || !messages) {
      throw new Error('Missing agentId or messages');
    }

    // Fetch agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found');
    }

    // Check access
    if (!agent.is_published && agent.user_id !== userId) {
      throw new Error('Access denied');
    }

    // Send execution started event
    ws.send(JSON.stringify({
      type: 'agent_execution_started',
      agentId
    }));

    // Execute agent with streaming
    const { executeAgent } = await import('../services/agentExecutor');

    await executeAgent({
      agent,
      messages,
      userId,
      stream: true,
      onChunk: (chunk: string) => {
        ws.send(JSON.stringify({
          type: 'agent_chunk',
          content: chunk
        }));
      },
      onDone: (result: any) => {
        ws.send(JSON.stringify({
          type: 'agent_execution_complete',
          ...result
        }));
      },
      onError: (error: Error) => {
        ws.send(JSON.stringify({
          type: 'agent_execution_error',
          error: error.message
        }));
      }
    });

  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : 'Execution failed'
    }));
  }
}
