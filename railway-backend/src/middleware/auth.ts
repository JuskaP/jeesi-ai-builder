import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for auth middleware
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

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
