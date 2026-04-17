import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient.js';

/**
 * Extract the effective role from a user object.
 * The frontend sometimes sends the full Supabase auth user (role: 'authenticated')
 * instead of our compact {id, role, email} payload. This helper normalises both.
 */
function extractRole(user: any): string | undefined {
  // 1. Compact header format: { id, role: 'admin', email }
  if (user.role && user.role !== 'authenticated') return user.role;

  // 2. Full Supabase user — check app_metadata (set by admin functions)
  if (user.app_metadata?.role) return user.app_metadata.role;

  // 3. Full Supabase user — check user_metadata (set during sign-up)
  if (user.user_metadata?.role) return user.user_metadata.role;

  // 4. role is 'authenticated' (Supabase JWT default) — needs DB lookup
  return undefined;
}

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized - No user' });
  }

  const quickRole = extractRole(req.user);

  // Fast path — role already available from header
  if (quickRole === 'admin') {
    return next();
  }

  // Slow path — full Supabase user object was sent; look up role in DB
  if (quickRole === undefined && req.user.id) {
    try {
      // Try users table first, then profiles
      const { data: fromUsers } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .maybeSingle();

      const dbRole = fromUsers?.role;

      if (dbRole === 'admin') {
        // Normalise so downstream handlers can trust req.user.role
        req.user = { id: req.user.id, role: 'admin', email: req.user.email };
        return next();
      }

      // Try profiles table
      if (!dbRole) {
        const { data: fromProfiles } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', req.user.id)
          .maybeSingle();

        if (fromProfiles?.role === 'admin') {
          req.user = { id: req.user.id, role: 'admin', email: req.user.email };
          return next();
        }
      }
    } catch {
      // DB unreachable — fall through to 403
    }
  }

  return res.status(403).json({ message: 'Admin only - Insufficient permissions' });
};
