import { supabase } from '../config/supabaseClient.js';
import { AppError } from '../utils/errorHandler.js';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  category_id: string;
  stock_quantity: number;
  sku?: string;
  images?: string[];
  variations?: any[];
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  discount_price?: number;
  category_id?: string;
  stock_quantity?: number;
}

export class ProductService {
  async createProduct(input: CreateProductInput) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: input.name,
        description: input.description,
        price: input.price,
        discount_price: input.discount_price,
        category_id: input.category_id,
        stock_quantity: input.stock_quantity,
        sku: input.sku,
      })
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    return data;
  }

  async getProducts(filters?: { category_id?: string; limit?: number; offset?: number }) {
    let query = supabase.from('products').select('*');

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    const { data, error, count } = await query
      .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 10) - 1)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(400, error.message);
    return { products: data || [], total: count || 0 };
  }

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variations(*),
        product_images(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Product not found');
    return data;
  }

  async updateProduct(input: UpdateProductInput) {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...(input.name && { name: input.name }),
        ...(input.description && { description: input.description }),
        ...(input.price && { price: input.price }),
        ...(input.discount_price !== undefined && { discount_price: input.discount_price }),
        ...(input.category_id && { category_id: input.category_id }),
        ...(input.stock_quantity !== undefined && { stock_quantity: input.stock_quantity }),
      })
      .eq('id', input.id)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    return data;
  }

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new AppError(400, error.message);
  }

  async getCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw new AppError(400, error.message);
    return data || [];
  }

  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Category not found');
    return data;
  }
}
