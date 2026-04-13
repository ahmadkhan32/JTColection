import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { supabaseAdmin } from '../config/supabaseClient.js';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10, offset = 0 } = req.query;

  const { data, error, count } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

  if (error) throw new AppError(400, error.message);

  res.json({
    success: true,
    users: data || [],
    pagination: {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      total: count || 0,
    },
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new AppError(404, 'User not found');

  res.json({
    success: true,
    user: data,
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    throw new AppError(400, 'Invalid role');
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(400, error.message);

  res.json({
    success: true,
    message: 'User role updated successfully',
    user: data,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id);

  if (error) throw new AppError(400, error.message);

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});
