import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient.js';

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
  const resolvedUserId = req.user?.id || userId;

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
      size: item.size,
      color: item.color,
    }));

    if (orderItems.length > 0) {
      await supabase.from("order_items").insert(orderItems);

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

  } catch (err) {
    res.status(500).json({ error: "Order failed" });
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
