import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabaseClient.js';

/** True when the error means the table doesn't exist yet */
const isMissingTable = (err: { code?: string; message?: string }) =>
  err?.code === '42P01' ||
  err?.code === 'PGRST200' ||
  (err?.message ?? '').toLowerCase().includes('relation') ||
  (err?.message ?? '').toLowerCase().includes('does not exist');

// ── GET ALL (Admin) ──────────────────────────────────────────────────────────
export const getAllReturns = async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('returns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingTable(error)) {
      return res.json({ data: [], setupRequired: true, message: 'returns table not yet created — run the SQL migration in Supabase.' });
    }
    return res.status(500).json({ error: error.message });
  }
  res.json({ data });
};

// ── GET BY USER (Customer) ───────────────────────────────────────────────────
export const getReturnsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { data, error } = await supabaseAdmin
    .from('returns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingTable(error)) return res.json({ data: [] });
    return res.status(500).json({ error: error.message });
  }
  res.json({ data });
};

// ── GET BY ORDER (Customer / Admin) ─────────────────────────────────────────
export const getReturnByOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { data, error } = await supabaseAdmin
    .from('returns')
    .select('*')
    .eq('order_id', orderId);

  if (error) {
    if (isMissingTable(error)) return res.json({ data: [] });
    return res.status(500).json({ error: error.message });
  }
  res.json({ data });
};

// ── CREATE (Customer) ────────────────────────────────────────────────────────
export const createReturn = async (req: Request, res: Response) => {
  const { order_id, user_id, reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'reason is required' });
  }

  // Prevent duplicate return requests for the same order
  if (order_id) {
    const { data: existing } = await supabaseAdmin
      .from('returns')
      .select('id, status')
      .eq('order_id', order_id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        error: 'A return request already exists for this order',
        existing,
      });
    }
  }

  const { data, error } = await supabaseAdmin
    .from('returns')
    .insert({
      order_id: order_id || null,
      user_id: user_id || null,
      reason,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ data });
};

// ── UPDATE STATUS / REFUND (Admin) ───────────────────────────────────────────
export const updateReturn = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, refund_status, admin_notes } = req.body;

  const updates: Record<string, unknown> = {};
  if (status        !== undefined) updates.status        = status;
  if (refund_status !== undefined) updates.refund_status = refund_status;
  if (admin_notes   !== undefined) updates.admin_notes   = admin_notes;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const { data, error } = await supabaseAdmin
    .from('returns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
};

// ── DELETE (Admin) ───────────────────────────────────────────────────────────
export const deleteReturn = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('returns').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
};
