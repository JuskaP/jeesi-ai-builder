import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { agentRouter } from './routes/agent';
import { websocketServer } from './websocket/server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'jeesi-railway-backend'
  });
});

// Supabase JWT authentication middleware
export const authenticateSupabaseJWT = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET not configured');
    }

    // Verify JWT token from Supabase
    const decoded = jwt.verify(token, jwtSecret) as { sub: string; email: string };
    
    // Attach user info to request
    (req as any).user = {
      id: decoded.sub,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// API key authentication middleware (for widget/external calls)
export const authenticateAPIKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    // Verify API key exists in database
    const { data: keyData, error } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key_prefix', apiKey.substring(0, 8))
      .eq('is_active', true)
      .single();

    if (error || !keyData) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Attach user info to request
    (req as any).user = {
      id: keyData.user_id
    };

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_prefix', apiKey.substring(0, 8));

    next();
  } catch (error) {
    console.error('API key auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Routes
app.use('/api/agent', agentRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Railway backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Initialize WebSocket server
websocketServer(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
