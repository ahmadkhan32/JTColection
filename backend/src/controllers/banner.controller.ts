import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabaseClient.js';

// ── GET all banners (admin — includes inactive) ──────────────────────────────
export const getAllBanners = async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*, banner_buttons(*), banner_versions(id, created_at, changed_by)')
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ── GET active banners (public) ───────────────────────────────────────────────
export const getActiveBanners = async (_req: Request, res: Response) => {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*, banner_buttons(*)')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ── GET single banner ─────────────────────────────────────────────────────────
export const getBannerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*, banner_buttons(*), banner_versions(*)')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Banner not found' });
  res.json(data);
};

// ── CREATE banner ─────────────────────────────────────────────────────────────
export const createBanner = async (req: Request, res: Response) => {
  const { buttons, ...bannerData } = req.body as {
    buttons?: unknown[];
    [k: string]: unknown;
  };

  const { data: banner, error } = await supabaseAdmin
    .from('banners')
    .insert(bannerData)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Insert buttons if provided
  if (Array.isArray(buttons) && buttons.length > 0) {
    const btnRows = buttons.map((b: unknown, i: number) => ({
      ...(b as object),
      banner_id: banner.id,
      sort_order: i,
    }));
    await supabaseAdmin.from('banner_buttons').insert(btnRows);
  }

  // Fetch full banner with buttons
  const { data: full } = await supabaseAdmin
    .from('banners')
    .select('*, banner_buttons(*)')
    .eq('id', banner.id)
    .single();

  res.status(201).json(full);
};

// ── UPDATE banner (saves version history automatically via DB trigger) ────────
export const updateBanner = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { buttons, ...bannerData } = req.body as {
    buttons?: Array<{ id?: string; [k: string]: unknown }>;
    [k: string]: unknown;
  };

  // Add changed_by from auth header if present
  const changedBy = (req.headers['x-admin-email'] as string) ?? 'admin';

  const { data: updated, error } = await supabaseAdmin
    .from('banners')
    .update({ ...bannerData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Upsert buttons if provided
  if (Array.isArray(buttons)) {
    // Delete removed buttons (those not in the incoming list)
    const incomingIds = buttons.filter(b => b.id).map(b => b.id as string);
    if (incomingIds.length > 0) {
      // delete buttons not in list
      await supabaseAdmin
        .from('banner_buttons')
        .delete()
        .eq('banner_id', id)
        .not('id', 'in', `(${incomingIds.map(i => `"${i}"`).join(',')})`);
    } else {
      // No IDs — delete all then re-insert
      await supabaseAdmin.from('banner_buttons').delete().eq('banner_id', id);
    }

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      if (btn.id) {
        await supabaseAdmin.from('banner_buttons').update({ ...btn, sort_order: i }).eq('id', btn.id);
      } else {
        await supabaseAdmin.from('banner_buttons').insert({ ...btn, banner_id: id, sort_order: i });
      }
    }
  }

  // Manually record changed_by in versions table (trigger saves the row but not the user)
  await supabaseAdmin
    .from('banner_versions')
    .update({ changed_by: changedBy })
    .eq('banner_id', id)
    .is('changed_by', null);

  const { data: full } = await supabaseAdmin
    .from('banners')
    .select('*, banner_buttons(*)')
    .eq('id', id)
    .single();

  res.json(full);
};

// ── DELETE banner ─────────────────────────────────────────────────────────────
export const deleteBanner = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('banners').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
};

// ── RESTORE previous version ──────────────────────────────────────────────────
export const restoreBannerVersion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { version_id } = req.body as { version_id: string };

  if (!version_id) return res.status(400).json({ error: 'version_id required' });

  // Get the version's snapshot
  const { data: version, error: vErr } = await supabaseAdmin
    .from('banner_versions')
    .select('previous_data')
    .eq('id', version_id)
    .eq('banner_id', id)
    .single();

  if (vErr || !version) return res.status(404).json({ error: 'Version not found' });

  const snapshot = version.previous_data as Record<string, unknown>;

  // Strip non-column meta fields before restoring
  const { id: _id, created_at: _c, updated_at: _u, ...restoreData } = snapshot;

  const { data: restored, error: rErr } = await supabaseAdmin
    .from('banners')
    .update({ ...restoreData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (rErr) return res.status(500).json({ error: rErr.message });
  res.json(restored);
};

// ── REORDER banners ───────────────────────────────────────────────────────────
export const reorderBanners = async (req: Request, res: Response) => {
  const { items } = req.body as { items: Array<{ id: string; sort_order: number }> };
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

  await Promise.all(
    items.map(({ id, sort_order }) =>
      supabaseAdmin.from('banners').update({ sort_order }).eq('id', id)
    )
  );
  res.json({ success: true });
};

// ── TOGGLE active ─────────────────────────────────────────────────────────────
export const toggleBannerActive = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_active } = req.body as { is_active: boolean };
  const { data, error } = await supabaseAdmin
    .from('banners')
    .update({ is_active })
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ── GET version history ───────────────────────────────────────────────────────
export const getBannerVersions = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('banner_versions')
    .select('*')
    .eq('banner_id', id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ── GET analytics for a banner ────────────────────────────────────────────────
export const getBannerAnalytics = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('banner_analytics')
    .select('*')
    .eq('banner_id', id)
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) return res.status(500).json({ error: error.message });

  // Aggregate
  const impressions = data.filter(r => r.event_type === 'impression').length;
  const clicks      = data.filter(r => r.event_type === 'click').length;
  const ctr         = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0';

  res.json({ impressions, clicks, ctr, raw: data });
};

// ── GET all banners analytics summary ────────────────────────────────────────
export const getAllAnalyticsSummary = async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('banner_analytics')
    .select('banner_id, event_type');

  if (error) return res.status(500).json({ error: error.message });

  const summary: Record<string, { impressions: number; clicks: number }> = {};
  for (const row of data) {
    if (!summary[row.banner_id]) summary[row.banner_id] = { impressions: 0, clicks: 0 };
    if (row.event_type === 'impression') summary[row.banner_id].impressions++;
    if (row.event_type === 'click')      summary[row.banner_id].clicks++;
  }

  res.json(summary);
};
