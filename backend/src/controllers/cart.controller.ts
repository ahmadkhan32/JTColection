import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabaseClient.js';

// GET /api/cart — fetch all cart items for the authenticated user
export const getCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('cart')
    .select('id, quantity, selected_size, selected_color, products(id, title, price, image_url, stock)')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
};

// POST /api/cart — upsert item (insert or increment quantity)
// Body: { product_id, quantity?, selected_size?, selected_color? }
export const addToCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { product_id, quantity = 1, selected_size, selected_color } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id required' });

  const normSize  = selected_size  || null;
  const normColor = selected_color || null;

  // Look for an existing row for this exact product+size+color combo
  let query = supabase
    .from('cart')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', product_id);
  query = normSize  ? query.eq('selected_size',  normSize)  : query.is('selected_size',  null);
  query = normColor ? query.eq('selected_color', normColor) : query.is('selected_color', null);

  const { data: existing } = await query.maybeSingle();

  if (existing) {
    // Row exists — bump quantity
    const { data, error } = await supabase
      .from('cart')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // New row — insert
  const { data, error } = await supabase
    .from('cart')
    .insert({ user_id: userId, product_id, quantity, selected_size: normSize, selected_color: normColor })
    .select()
    .single();

  if (error) {
    // 23505 unique violation — race condition: row appeared between our SELECT and INSERT
    if (error.code === '23505') {
      const { data: row } = await supabase
        .from('cart').select('id, quantity').eq('user_id', userId).eq('product_id', product_id).limit(1).maybeSingle();
      if (row) {
        const { data: updated } = await supabase.from('cart').update({ quantity: row.quantity + quantity }).eq('id', row.id).select().single();
        return res.json(updated);
      }
    }
    return res.status(500).json({ error: error.message, code: error.code });
  }

  return res.status(201).json(data);
};

// PUT /api/cart/:id — set quantity for a specific cart row
// Body: { quantity }
export const updateCartItem = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== 'number' || quantity < 1) {
    return res.status(400).json({ error: 'quantity must be >= 1' });
  }

  const { data, error } = await supabase
    .from('cart')
    .update({ quantity })
    .eq('id', id)
    .eq('user_id', userId) // ownership check
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};

// DELETE /api/cart/:id — remove a single cart item
export const removeCartItem = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
};

// DELETE /api/cart — clear the entire cart for the authenticated user
export const clearCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { error } = await supabase.from('cart').delete().eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
};
