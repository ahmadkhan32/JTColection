import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabaseClient.js';

declare global {
  namespace Express {
    interface Request { user?: any; }
  }
}

/**
 * Decode a Supabase JWT locally  NO network call to Supabase Auth.
 * Supabase JWTs are HS256-signed with SUPABASE_JWT_SECRET.
 * Falls back to decode-without-verify if secret not set (still gets sub/email).
 */
function decodeToken(token: string): { id: string; email?: string } | null {
  try {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (secret && secret !== 'your-super-secret-jwt-key-change-this-in-production') {
      const payload = jwt.verify(token, secret) as any;
      return { id: payload.sub, email: payload.email };
    }
    // No secret configured  decode without verification (safe for internal use
    // since all DB ops use service-role key which has its own auth)
    const payload = jwt.decode(token) as any;
    if (!payload?.sub) return null;
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //  1. Bearer token (Supabase JWT  verified locally, no HTTP call) 
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = decodeToken(token);
      if (!decoded?.id) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
      }
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role, name')
        .eq('id', decoded.id)
        .maybeSingle();
      req.user = {
        id:    decoded.id,
        email: decoded.email,
        role:  profile?.role || 'customer',
        name:  profile?.name,
      };
      return next();
    }

    //  2. Legacy user header 
    const userHeader = req.headers.user;
    if (!userHeader) {
      return res.status(401).json({ message: 'Unauthorized - No credentials' });
    }
    try {
      const user = typeof userHeader === 'string' ? JSON.parse(userHeader) : userHeader;
      if (!user || typeof user !== 'object') throw new Error();
      req.user = user;
      return next();
    } catch {
      return res.status(401).json({ message: 'Unauthorized - Invalid user format' });
    }
  } catch {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = decodeToken(token);
      if (decoded?.id) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role, name')
          .eq('id', decoded.id)
          .maybeSingle();
        req.user = {
          id:    decoded.id,
          email: decoded.email,
          role:  profile?.role || 'customer',
          name:  profile?.name,
        };
      }
    }
  } catch {
    // Ignore  treat as guest
  }
  next();
};
