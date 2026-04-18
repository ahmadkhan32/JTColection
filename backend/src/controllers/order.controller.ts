import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabaseClient.js';
import { generateInvoicePDF } from '../services/invoice.service.js';
import { sendOrderConfirmationEmail } from '../services/email.service.js';

export const createOrder = async (req: Request, res: Response) => {
  const {
    items = [],
    totalAmount,
    total_amount,
    address,
    city,
    postal_code,
    customer_name,
    email,
    phone,
    paymentMethod,
    payment_method,
    status,
    userId,
    currency,
  } = req.body;
  const resolvedUserId = req.user?.id || (userId && /^[0-9a-f-]{36}$/.test(userId) ? userId : null);

  try {
    const normalizedTotal = Number(totalAmount ?? total_amount ?? 0);
    const normalizedPaymentMethod = paymentMethod || payment_method || 'COD';
    const normalizedStatus = status || 'pending';

    const baseInsertData: Record<string, any> = {
      user_id: resolvedUserId,
      total_amount: normalizedTotal,
      address,
      city,
      postal_code,
      customer_name,
      email,
      phone,
      payment_method: normalizedPaymentMethod,
      status: normalizedStatus,
      currency: currency || 'PKR',
    };

    let { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([baseInsertData])
      .select()
      .single();

    // Fallback: if currency column doesn't exist yet (migration not run), retry without it
    if (orderError && (orderError.code === 'PGRST204' || (orderError.message || '').includes("'currency'"))) {
      console.warn('[createOrder] currency column missing — retrying without it (run CURRENCY_INVOICE_MIGRATION.sql)');
      const { currency: _c, ...fallbackData } = baseInsertData;
      ({ data: order, error: orderError } = await supabase
        .from("orders")
        .insert([fallbackData])
        .select()
        .single());
    }

    if (orderError || !order) {
      console.error('[createOrder] orders insert failed:', orderError?.message, orderError?.code);
      return res.status(500).json({ error: 'Order creation failed', details: orderError?.message || 'No data returned' });
    }

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id || item.productId,
      quantity: item.quantity,
      price: item.price,
      price_at_purchase: item.price,   // DB uses this column name (NOT NULL)
      size: item.size,
      color: item.color,
    }));

    if (orderItems.length > 0) {
      // Try inserting full item rows
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) {
        // PGRST204 = column not found in schema cache; 42703 = undefined column in PG
        const isColumnMissing = itemsError.code === 'PGRST204' || itemsError.code === '42703';
        if (isColumnMissing) {
          // FULL_SETUP.sql not yet run — fallback to absolute minimum columns
          const minimal = orderItems.map((item: any) => ({
            order_id:          item.order_id,
            product_id:        item.product_id,
            quantity:          item.quantity,
            price_at_purchase: item.price_at_purchase ?? item.price ?? 0,
          }));
          const { error: minError } = await supabase.from('order_items').insert(minimal);
          if (minError) console.error('[createOrder] order_items minimal insert failed:', minError.message, minError.code);
          else console.warn('[createOrder] Inserted order_items without price/size/color — run FULL_SETUP.sql to fix schema');
        } else {
          console.error('[createOrder] order_items insert failed:', itemsError.message, itemsError.code);
        }
      }

      // Decrement stock for each item
      for (const item of items) {
        const pid = item.product_id || item.productId;
        if (!pid) continue;
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', pid)
          .single();
        if (product) {
          const newStock = Math.max(0, (product.stock || 0) - item.quantity);
          await supabase.from('products').update({ stock: newStock }).eq('id', pid);
        }
      }
    }

    // Fire-and-forget: generate PDF invoice + send confirmation email
    if (order?.email) {
      const itemsForInvoice = items.map((item: any) => ({
        products: { title: item.title || item.name || item.product_name || 'Product' },
        quantity: item.quantity,
        price_at_purchase: item.price,
      }));
      generateInvoicePDF({ ...order }, itemsForInvoice)
        .then(pdf => sendOrderConfirmationEmail({ ...order }, pdf))
        .catch((e: any) => console.warn('[Order] Email/invoice error:', e?.message));
    }

    res.json({ success: true, id: order.id, order });

  } catch (err: any) {
    console.error('[createOrder] Error:', err?.message || err);
    res.status(500).json({ error: "Order failed", details: err?.message || String(err) });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(id, quantity, price_at_purchase, size, color, products(id, title, image_url, price))')
      .eq('id', id)
      .single();
    if (error || !data) return res.status(404).json({ message: 'Order not found' });

    // Normalize price_at_purchase → price for frontend
    const order = {
      ...data,
      order_items: (data.order_items || []).map((item: any) => ({
        ...item,
        price: item.price_at_purchase ?? item.price ?? 0,
      })),
    };
    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  const targetUserId = req.params.id || req.user?.id;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.json({ success: true, orders: data || [] });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user orders' });
  }
};

// PUT /api/orders/:id — customer edits address/phone (only if pending/confirmed)
export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { address, phone, city, postal_code } = req.body;
  const userId = req.user?.id;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('orders').select('id, status, user_id').eq('id', id).single();

    if (fetchError || !existing) return res.status(404).json({ error: 'Order not found' });

    if (!['pending', 'confirmed'].includes(existing.status)) {
      return res.status(403).json({ error: `Cannot edit order with status "${existing.status}"` });
    }
    if (userId && existing.user_id && existing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updates: Record<string, string> = {};
    if (address)     updates.address     = address;
    if (phone)       updates.phone       = phone;
    if (city)        updates.city        = city;
    if (postal_code) updates.postal_code = postal_code;

    const { data, error } = await supabase
      .from('orders').update(updates).eq('id', id).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, order: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Update failed' });
  }
};

// DELETE /api/orders/:id — customer cancels order (sets status = cancelled)
export const cancelOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('orders').select('id, status, user_id').eq('id', id).single();

    if (fetchError || !existing) return res.status(404).json({ error: 'Order not found' });

    if (!['pending', 'confirmed'].includes(existing.status)) {
      return res.status(403).json({ error: `Cannot cancel order with status "${existing.status}"` });
    }
    if (userId && existing.user_id && existing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('orders').update({ status: 'cancelled' }).eq('id', id).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, order: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Cancel failed' });
  }
};
