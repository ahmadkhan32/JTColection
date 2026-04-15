import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, full_name, role } = req.body;

  if (!email || !password) {
    throw new AppError(400, 'Email and password are required');
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw new AppError(400, authError.message);

  const defaultRole = role === 'admin' ? 'admin' : 'customer';

  // Keep compatibility with both profile schemas used in this project.
  const [usersInsert, profilesInsert] = await Promise.all([
    supabase.from('users').insert({
      id: authData.user!.id,
      email,
      name: full_name || email.split('@')[0],
      role: defaultRole,
    }),
    supabase.from('profiles').insert({
      id: authData.user!.id,
      email,
      full_name: full_name || email.split('@')[0],
      role: defaultRole,
    }),
  ]);

  if (usersInsert.error && profilesInsert.error) {
    throw new AppError(400, usersInsert.error.message || profilesInsert.error.message);
  }

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: {
      id: authData.user!.id,
      email: authData.user!.email,
      role: defaultRole,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, 'Email and password are required');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new AppError(401, 'Invalid credentials');

  const [{ data: userRecord }, { data: profileRecord }] = await Promise.all([
    supabase.from('users').select('id, role, name, email').eq('id', data.user!.id).maybeSingle(),
    supabase.from('profiles').select('id, role, full_name, email').eq('id', data.user!.id).maybeSingle(),
  ]);

  const effectiveRole = userRecord?.role || profileRecord?.role || 'customer';

  res.json({
    success: true,
    message: 'Login successful',
    token: data.session!.access_token,
    user: {
      id: data.user!.id,
      email: data.user!.email,
      role: effectiveRole,
      name: userRecord?.name || profileRecord?.full_name || data.user!.email,
    },
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(401, 'Not authenticated');
  }

  const [{ data: fromUsers }, { data: fromProfiles }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
  ]);

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      ...(fromUsers || fromProfiles || {}),
    },
  });
});
