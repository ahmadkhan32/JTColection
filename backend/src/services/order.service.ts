import { supabase, supabaseAdmin } from '../config/supabaseClient.js';
import { AppError } from '../utils/errorHandler.js';

export interface CreateOrderInput {
  user_id: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  total_amount: number;
  shipping_address?: string;
}

export interface UpdateOrderInput {
  id: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: string;
}

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    try {
      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: input.user_id,
          total_amount: input.total_amount,
          shipping_address: input.shipping_address,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw new AppError(400, orderError.message);

      // Insert order items
      const orderItems = input.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw new AppError(400, itemsError.message);

      // Clear user's cart
      await supabase.from('cart').delete().eq('user_id', input.user_id);

      return order;
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(400, error.message);
    }
  }

  async getOrdersByUserId(userId: string, limit = 10, offset = 0) {
    const { data, error, count } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items(
          *,
          products(*)
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError(400, error.message);
    return { orders: data || [], total: count || 0 };
  }

  async getAllOrders(limit = 10, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('orders')
      .select(
        `
        *,
        order_items(*),
        profiles(*)
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError(400, error.message);
    return { orders: data || [], total: count || 0 };
  }

  async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items(
          *,
          products(*)
        ),
        profiles(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Order not found');
    return data;
  }

  async updateOrder(input: UpdateOrderInput) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        ...(input.status && { status: input.status }),
        ...(input.shipping_address && { shipping_address: input.shipping_address }),
      })
      .eq('id', input.id)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    return data;
  }

  async deleteOrder(id: string) {
    // Delete order items first
    await supabaseAdmin.from('order_items').delete().eq('order_id', id);

    // Delete order
    const { error } = await supabaseAdmin.from('orders').delete().eq('id', id);
    if (error) throw new AppError(400, error.message);
  }

  async getOrderStats() {
    const { data: allOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' });

    if (!allOrders) return { total_orders: 0, total_revenue: 0, by_status: {} };

    const stats = {
      total_orders: allOrders.length,
      total_revenue: allOrders.reduce((sum: number, order: any) => sum + order.total_amount, 0),
      by_status: allOrders.reduce(
        (acc: any, order: any) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        },
        {}
      ),
    };

    return stats;
  }
}
