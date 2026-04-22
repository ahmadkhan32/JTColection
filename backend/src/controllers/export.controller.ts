import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabaseClient.js';
import { generateOrdersCSV } from '../services/csv.service.js';
import { generateOrdersReportPDF } from '../services/report.service.js';
import type { ExportOrder } from '../services/csv.service.js';

// ── Shared helper: fetch + filter orders ─────────────────────────────────────
async function fetchOrders(query: Record<string, string | undefined>): Promise<{ orders: ExportOrder[]; error: string | null }> {
  const { status, from, to, search, category } = query;

  let q = supabase
    .from('orders')
    .select(
      `id, customer_name, email, phone, address, city, total_amount, currency, status, payment_method, created_at,
       order_items(id, quantity, price, price_at_purchase, size, color,
         products(id, title, image_url, categories(id, name))
       )`
    )
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    q = q.eq('status', status);
  }
  if (from) {
    q = q.gte('created_at', `${from}T00:00:00.000Z`);
  }
  if (to) {
    q = q.lte('created_at', `${to}T23:59:59.999Z`);
  }
  if (search) {
    q = q.ilike('customer_name', `%${search}%`);
  }

  const { data, error } = await q;

  if (error) return { orders: [], error: error.message };

  let orders = (data as ExportOrder[]) ?? [];

  // Category filter — applied in-memory because PostgREST cannot deep-filter
  // on an embedded join (products.categories.name) without an RPC.
  if (category) {
    const cat = category.toLowerCase();
    orders = orders.filter(o =>
      (o.order_items ?? []).some(
        item => (item.products?.categories?.name ?? '').toLowerCase() === cat
      )
    );
  }

  return { orders, error: null };
}

// ── GET /api/admin/export/csv ─────────────────────────────────────────────────
export const exportCSV = async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  const { orders, error } = await fetchOrders(query);

  if (error) {
    return res.status(500).json({ error: `Failed to fetch orders: ${error}` });
  }
  if (orders.length === 0) {
    return res.status(404).json({ error: 'No orders match the specified filters' });
  }

  const csv = generateOrdersCSV(orders);
  const dateTag = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="JT-Orders-${dateTag}.csv"`);
  res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
  return res.send(csv);
};

// ── GET /api/admin/export/pdf ─────────────────────────────────────────────────
export const exportPDF = async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  const { orders, error } = await fetchOrders(query);

  if (error) {
    return res.status(500).json({ error: `Failed to fetch orders: ${error}` });
  }
  if (orders.length === 0) {
    return res.status(404).json({ error: 'No orders match the specified filters' });
  }

  const pdfBuffer = await generateOrdersReportPDF(orders, {
    status: query.status,
    from: query.from,
    to: query.to,
    category: query.category,
  });

  const dateTag = new Date().toISOString().slice(0, 10);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="JT-Orders-Report-${dateTag}.pdf"`);
  res.setHeader('Content-Length', String(pdfBuffer.length));
  return res.send(pdfBuffer);
};
