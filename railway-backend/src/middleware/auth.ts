import { Request, Response, NextFunction } from 'express';

/**
 * Verify Railway shared secret middleware
 * This is the ONLY authentication needed for Railway backend
 * All user/credit validation happens in the edge function before reaching Railway
 */
export const verifyRailwaySecret = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const providedSecret = req.headers['x-railway-secret'] as string;
  const expectedSecret = process.env.RAILWAY_BACKEND_SECRET;

  if (!expectedSecret) {
    console.error('[AUTH] RAILWAY_BACKEND_SECRET not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!providedSecret) {
    console.warn('[AUTH] Missing x-railway-secret header');
    return res.status(401).json({ error: 'Missing authentication' });
  }

  if (providedSecret !== expectedSecret) {
    console.warn('[AUTH] Invalid railway secret');
    return res.status(401).json({ error: 'Invalid authentication' });
  }

  next();
};
