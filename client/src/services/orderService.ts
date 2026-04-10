import { supabase } from './supabaseClient';

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

  async placeOrder(orderData: any, items: any[]) {
    // 1. Insert Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert Order Items (attached to line items)
    const itemsToInsert = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      size: item.selectedSize,
      color: item.selectedColor
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // 3. Automated Stock Reduction
    for (const item of items) {
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

    return order;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
