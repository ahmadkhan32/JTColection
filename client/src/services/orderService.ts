import { supabase } from './supabaseClient';
import { productService } from './productService';

export const orderService = {
  async fetchUserOrders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async placeOrder(orderData: Record<string, unknown>, items: Array<{
    id: string;
    quantity: number;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
    variationId?: string;
  }>) {
    // 1. Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items — include variation_id per SRS order_items schema
    const itemsToInsert = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      variation_id: item.variationId || null,
      quantity: item.quantity,
      price: item.price,
      size: item.selectedSize || null,
      color: item.selectedColor || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // 3. Reduce stock — prefer variation stock, fallback to product stock
    for (const item of items) {
      if (item.variationId) {
        // Reduce variation-level stock (granular per SRS)
        await productService.reduceVariationStock(item.variationId, item.quantity);
      } else {
        // Fallback: reduce product-level stock
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ stock: Math.max(0, product.stock - item.quantity) })
            .eq('id', item.id);
        }
      }
    }

    return order;
  },

  async updateOrderStatus(orderId: string, status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled') {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin: fetch all orders
  async fetchAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(title, image_url))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
