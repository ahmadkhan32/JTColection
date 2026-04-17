import { Request, Response } from 'express';
// Use the service-role client for ALL admin operations so RLS never blocks writes or joins.
import { supabaseAdmin as supabase } from '../config/supabaseClient.js';

// ── Orders ───────────────────────────────────────────────────────────────────

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `id, customer_name, phone, email, address, city, postal_code,
         total_amount, status, payment_method, payment_status, created_at,
         order_items(id, quantity, price_at_purchase, size, color,
           products(id, title, image_url, stock)
         )`
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getAllOrders] error:', error.message, error.code);
      return res.json([]);
    }

    // Normalize price_at_purchase → price for frontend compatibility
    const normalized = (data || []).map((order: any) => ({
      ...order,
      order_items: (order.order_items || []).map((item: any) => ({
        ...item,
        price: item.price_at_purchase ?? item.price ?? 0,
      })),
    }));

    res.json(normalized);
  } catch (err: any) {
    if (err?.cause?.code === 'ENOTFOUND' || err?.message?.includes('fetch')) {
      return res.json([]);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, order: data });
  } catch (err: any) {
    if (err?.cause?.code === 'ENOTFOUND' || err?.message?.includes('fetch')) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    if (err?.cause?.code === 'ENOTFOUND' || err?.message?.includes('fetch')) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ── Products ─────────────────────────────────────────────────────────────────

export const adminGetProducts = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug), subcategories(name, slug)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, products: data || [] });
};

/** Build a URL-safe slug from a title and append a base-36 timestamp suffix for uniqueness. */
function buildUniqueSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${Date.now().toString(36)}`;
}

export const adminCreateProduct = async (req: Request, res: Response) => {
  const body = { ...req.body };
  // Always ensure a unique slug — use supplied value as prefix if present
  const baseTitle = body.slug || body.title || 'product';
  body.slug = buildUniqueSlug(baseTitle);

  const { data, error } = await supabase
    .from('products')
    .insert(body)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ success: true, product: data });
};

export const adminUpdateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('products')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, product: data });
};

export const adminDeleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, message: 'Product deleted' });
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a name to a URL-safe slug. Returns null for empty input. */
function toSlug(name: string): string | null {
  if (!name?.trim()) return null;
  return name.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '') || null;
}

/** Ensure slug is unique in a given table by appending a short hash suffix if needed. */
async function ensureUniqueSlug(
  table: string,
  slug: string,
  excludeId?: string
): Promise<string> {
  let candidate = slug;
  let attempt = 0;
  while (attempt < 10) {
    let q = supabase.from(table).select('id').eq('slug', candidate);
    if (excludeId) q = q.neq('id', excludeId);
    const { data } = await q;
    if (!data || data.length === 0) return candidate;
    candidate = `${slug}-${(Date.now() % 1000).toString(36)}${attempt}`;
    attempt++;
  }
  return `${slug}-${Date.now().toString(36)}`;
}

// ── Categories ────────────────────────────────────────────────────────────────

export const adminGetCategories = async (req: Request, res: Response) => {
  // Raw SQL: join categories with subcategory count
  const { data, error } = await supabase.rpc('admin_get_categories_with_subcounts');

  if (error) {
    // Fallback: plain select if RPC not yet created
    const { data: fallback, error: e2 } = await supabase
      .from('categories')
      .select('*, subcategories(*)')
      .order('name', { ascending: true });
    if (e2) return res.status(500).json({ error: e2.message });
    return res.json({ success: true, categories: fallback || [] });
  }
  res.json({ success: true, categories: data || [] });
};

export const adminCreateCategory = async (req: Request, res: Response) => {
  const { name, description, image_url } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Category name is required' });

  let slug = toSlug(req.body.slug || name);
  if (slug) slug = await ensureUniqueSlug('categories', slug);

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name.trim(), slug, description: description || null, image_url: image_url || null })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ success: true, category: data });
};

export const adminUpdateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, image_url } = req.body;

  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description || null;
  if (image_url !== undefined) updates.image_url = image_url || null;

  // Regenerate slug if name changed or explicit slug provided
  const rawSlug = req.body.slug || (name ? name : null);
  if (rawSlug) {
    const base = toSlug(rawSlug);
    if (base) updates.slug = await ensureUniqueSlug('categories', base, id);
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, category: data });
};

export const adminDeleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Use a SQL transaction via RPC to:
  //  1. Null-out products.category_id (also handled by ON DELETE SET NULL in schema)
  //  2. Delete subcategories (also handled by ON DELETE CASCADE)
  //  3. Delete the category
  // Supabase schema already has ON DELETE CASCADE for subcategories and
  // ON DELETE SET NULL for products, so a plain delete is safe.
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, message: 'Category and its subcategories deleted. Linked products unlinked.' });
};

export const adminGetSubcategories = async (req: Request, res: Response) => {
  const { category_id } = req.query;
  let query = supabase
    .from('subcategories')
    .select('*, categories(name, slug)')
    .order('name', { ascending: true });

  if (category_id) query = query.eq('category_id', category_id as string);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, subcategories: data || [] });
};

export const adminCreateSubcategory = async (req: Request, res: Response) => {
  const { name, category_id, description } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Subcategory name is required' });
  if (!category_id) return res.status(400).json({ error: 'category_id is required' });

  let slug = toSlug(req.body.slug || name);
  if (slug) slug = await ensureUniqueSlug('subcategories', slug);

  const { data, error } = await supabase
    .from('subcategories')
    .insert({ name: name.trim(), slug, category_id, description: description || null })
    .select('*, categories(name)')
    .single();

  if (error) {
    // Handle UNIQUE(category_id, name) violation gracefully
    if (error.code === '23505') {
      return res.status(400).json({ error: `A subcategory named "${name}" already exists in this category.` });
    }
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json({ success: true, subcategory: data });
};

export const adminUpdateSubcategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category_id, description } = req.body;

  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name.trim();
  if (category_id !== undefined) updates.category_id = category_id;
  if (description !== undefined) updates.description = description || null;

  const rawSlug = req.body.slug || (name ? name : null);
  if (rawSlug) {
    const base = toSlug(rawSlug);
    if (base) updates.slug = await ensureUniqueSlug('subcategories', base, id);
  }

  const { data, error } = await supabase
    .from('subcategories')
    .update(updates)
    .eq('id', id)
    .select('*, categories(name)')
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: `A subcategory with this name already exists in the selected category.` });
    }
    return res.status(400).json({ error: error.message });
  }
  res.json({ success: true, subcategory: data });
};

export const adminDeleteSubcategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Products with this subcategory_id will have it SET NULL (schema: ON DELETE SET NULL)
  const { error } = await supabase.from('subcategories').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, message: 'Subcategory deleted' });
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const adminGetUsers = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  let users = data;
  if (error || !data?.length) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    users = profileData || [];
  }

  res.json({ success: true, users: users || [] });
};

export const adminGetAnalytics = async (req: Request, res: Response) => {
  try {
    const [
      { data: products },
      { data: orders },
      { data: users },
      { data: categories },
    ] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('orders').select('total_amount, status', { count: 'exact' }),
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('categories').select('id', { count: 'exact' }),
    ]);

    const totalRevenue =
      (orders || []).reduce((acc: number, o: any) => acc + Number(o.total_amount || 0), 0);

    res.json({
      success: true,
      analytics: {
        totalProducts: products?.length || 0,
        totalOrders: orders?.length || 0,
        totalUsers: users?.length || 0,
        totalCategories: categories?.length || 0,
        totalRevenue: totalRevenue.toFixed(2),
        pendingOrders: (orders || []).filter((o: any) => o.status === 'pending').length,
      },
    });
  } catch (err: any) {
    // Return zeros on network/offline errors so dashboard doesn't crash
    res.json({
      success: true,
      analytics: {
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalCategories: 0,
        totalRevenue: '0.00',
        pendingOrders: 0,
      },
    });
  }
};

// ── Dashboard (analytics + user roster) ──────────────────────────────────────

export const adminGetDashboard = async (req: Request, res: Response) => {
  try {
    const [
      { data: products },
      { data: orders },
      { data: profiles },
      { data: categories },
      { data: recentOrders },
    ] = await Promise.all([
      supabase.from('products').select('id'),
      supabase.from('orders').select('total_amount, status'),
      // Use profiles table — this is where Supabase auth users are stored
      supabase
        .from('profiles')
        .select('id, name, username, role, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('id'),
      // Recent 5 orders for activity feed
      supabase
        .from('orders')
        .select('id, customer_name, email, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const totalRevenue = (orders || []).reduce(
      (acc: number, o: any) => acc + Number(o.total_amount || 0),
      0
    );

    res.json({
      success: true,
      analytics: {
        totalProducts: products?.length || 0,
        totalOrders: orders?.length || 0,
        totalUsers: profiles?.length || 0,
        totalCategories: categories?.length || 0,
        totalRevenue: totalRevenue.toFixed(2),
        pendingOrders: (orders || []).filter((o: any) => o.status === 'pending').length,
      },
      recentOrders: (recentOrders || []).map((o: any) => ({
        id: o.id,
        customer_name: o.customer_name || o.email || 'Customer',
        total_amount: o.total_amount,
        status: o.status,
        created_at: o.created_at,
      })),
      users: (profiles || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        role: u.role,
        created_at: u.created_at,
      })),
    });
  } catch (_err: any) {
    res.json({
      success: true,
      analytics: {
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalCategories: 0,
        totalRevenue: '0.00',
        pendingOrders: 0,
      },
      recentOrders: [],
      users: [],
    });
  }
};