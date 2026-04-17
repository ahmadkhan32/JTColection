import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { supabaseAdmin } from '../config/supabaseClient.js';

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: The `users` table has a `password_hash NOT NULL` constraint that makes
// it impossible to insert rows via the API (Supabase auth manages passwords).
// All user data is stored in `profiles` only. Email comes from Supabase auth.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PUBLIC — called by Register page after supabase.auth.signUp().
 * Upserts a row into `profiles` (the only writable user table).
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { id, email, name, username, role } = req.body;
  if (!id || !email) throw new AppError(400, 'id and email are required');

  const safeRole = role === 'admin' ? 'admin' : 'customer';
  const displayName = name || username || email.split('@')[0];

  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ id, name: displayName, role: safeRole }, { onConflict: 'id' });

  if (error) throw new AppError(400, error.message);

  res.status(201).json({ success: true, message: 'User created', id, role: safeRole });
});

/**
 * PUBLIC — called by Login page to fetch role + name after Supabase sign-in.
 * Reads from profiles table only (no auth admin API — avoids network timeouts).
 * Auto-provisions a profile row if missing.
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role, name, username')
    .eq('id', id)
    .maybeSingle();

  if (!profile) {
    // Auto-provision for users who signed up outside our Register flow
    await supabaseAdmin
      .from('profiles')
      .upsert({ id, role: 'customer' }, { onConflict: 'id' });

    return res.json({
      success: true,
      user: { id, email: null, role: 'customer', name: null, username: null },
    });
  }

  res.json({
    success: true,
    user: {
      id,
      email:    null,
      role:     profile.role     || 'customer',
      name:     profile.name,
      username: profile.username,
    },
  });
});

/**
 * ADMIN — list all users (reads from profiles + joins email from auth).
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 20, offset = 0 } = req.query;

  const { data, error, count } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

  if (error) throw new AppError(400, error.message);

  res.json({ success: true, users: data || [], pagination: { limit, offset, total: count || 0 } });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role || !['customer', 'admin'].includes(role)) throw new AppError(400, 'Invalid role');

  const { error } = await supabaseAdmin.from('profiles').update({ role }).eq('id', id);
  if (error) throw new AppError(400, error.message);

  res.json({ success: true, message: 'Role updated', id, role });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await supabaseAdmin.from('profiles').delete().eq('id', id);
  res.json({ success: true, message: 'User deleted' });
});

/**
 * Alias for getUserById — same handler, alternative import name.
 * Returns: { success: true, user: { id, email, role, name, username } }
 */
export const getUser = getUserById;

