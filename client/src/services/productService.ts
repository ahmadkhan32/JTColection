import { supabase } from './supabaseClient';

export interface ProductQueryFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export const productService = {
  async fetchProducts(filters: ProductQueryFilters = {}) {
    let query = supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async fetchProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
};
