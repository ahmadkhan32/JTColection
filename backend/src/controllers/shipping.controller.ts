import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabaseClient.js';

// ── GET ALL (Admin) ──────────────────────────────────────────────────────────
export const getAllShipping = async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('shipping')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
};

// ── GET BY ORDER ID ──────────────────────────────────────────────────────────
export const getShippingByOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { data, error } = await supabaseAdmin
    .from('shipping')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
};

// ── GET BY USER ID ───────────────────────────────────────────────────────────
export const getShippingByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { data, error } = await supabaseAdmin
    .from('shipping')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
};

// ── CREATE (Admin) ───────────────────────────────────────────────────────────
export const createShipping = async (req: Request, res: Response) => {
  const {
    order_id, user_id, address, city, country,
    postal_code, shipping_method, tracking_number, notes,
  } = req.body;

  if (!address || !city) {
    return res.status(400).json({ error: 'address and city are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('shipping')
    .insert({
      order_id: order_id || null,
      user_id: user_id || null,
      address,
      city,
      country: country || 'Pakistan',
      postal_code: postal_code || null,
      shipping_method: shipping_method || 'standard',
      tracking_number: tracking_number || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ data });
};

// ── UPDATE STATUS / TRACKING (Admin) ────────────────────────────────────────
export const updateShipping = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, tracking_number, shipping_method, notes } = req.body;

  const updates: Record<string, unknown> = {};
  if (status            !== undefined) updates.status           = status;
  if (tracking_number   !== undefined) updates.tracking_number  = tracking_number;
  if (shipping_method   !== undefined) updates.shipping_method  = shipping_method;
  if (notes             !== undefined) updates.notes            = notes;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const { data, error } = await supabaseAdmin
    .from('shipping')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
};

// ── DELETE (Admin) ───────────────────────────────────────────────────────────
export const deleteShipping = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('shipping').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
};
