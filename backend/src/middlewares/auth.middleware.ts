import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient.js';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Fetch user role from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'user',
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};
