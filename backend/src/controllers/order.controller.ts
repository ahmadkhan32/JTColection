import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabaseClient.js';

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
  } = req.body;
  const resolvedUserId = req.user?.id || (userId && /^[0-9a-f-]{36}$/.test(userId) ? userId : null);

  try {
    const normalizedTotal = Number(totalAmount ?? total_amount ?? 0);
    const normalizedPaymentMethod = paymentMethod || payment_method || 'COD';
    const normalizedStatus = status || 'pending';

    const { data: order } = await supabase
      .from("orders")
      .insert([
        {
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
        }
      ])
      .select()
      .single();

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
