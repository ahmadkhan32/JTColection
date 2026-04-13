import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    throw new AppError(400, 'Email and password are required');
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw new AppError(400, authError.message);

  // Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user!.id,
    email,
    full_name: full_name || email.split('@')[0],
    role: 'user',
  });

  if (profileError) throw new AppError(400, profileError.message);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: {
      id: authData.user!.id,
      email: authData.user!.email,
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

  res.json({
    success: true,
    message: 'Login successful',
    token: data.session!.access_token,
    user: {
      id: data.user!.id,
      email: data.user!.email,
    },
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(401, 'Not authenticated');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      ...profile,
    },
  });
});
