import { supabase } from '../config/supabaseClient.js';
import { AppError } from '../utils/errorHandler.js';

export interface CreateProductInput {
  title: string;
  slug?: string;
  description: string;
  price: number;
  old_price?: number;
  discount_price?: number;
  category_id: string;
  subcategory_id?: string;
  stock: number;
  sku?: string;
  image_url?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  fabric?: string;
  work?: string;
  pieces?: number;
  includes?: string[];
  care_instructions?: string;
  is_new_arrival?: boolean;
  is_on_sale?: boolean;
  variations?: any[];
}

export interface UpdateProductInput {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  price?: number;
  old_price?: number;
  discount_price?: number;
  category_id?: string;
  subcategory_id?: string;
  stock?: number;
  image_url?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  fabric?: string;
  work?: string;
  pieces?: number;
  includes?: string[];
  care_instructions?: string;
  is_new_arrival?: boolean;
  is_on_sale?: boolean;
}

/** Convert a string to a URL-safe slug, e.g. "My Product!" → "my-product" */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // strip non-word chars
    .replace(/[\s_-]+/g, '-')   // spaces/underscores → hyphens
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
}

/** Generate a slug that is guaranteed unique by appending a short timestamp suffix. */
function uniqueSlug(title: string): string {
  return `${toSlug(title)}-${Date.now().toString(36)}`;
}

export class ProductService {
  async createProduct(input: CreateProductInput) {
    // Auto-generate a unique slug if none supplied
    const slug = input.slug ? input.slug : uniqueSlug(input.title);

    const { data, error } = await supabase
      .from('products')
      .insert({
        title: input.title,
        slug,
        description: input.description,
        price: input.price,
        old_price: input.old_price,
        discount_price: input.discount_price,
        category_id: input.category_id,
        subcategory_id: input.subcategory_id,
        stock: input.stock,
        image_url: input.image_url,
        images: input.images,
        sizes: input.sizes,
        colors: input.colors,
        fabric: input.fabric,
        work: input.work,
        pieces: input.pieces,
        includes: input.includes,
        care_instructions: input.care_instructions,
        is_new_arrival: input.is_new_arrival,
        is_on_sale: input.is_on_sale,
        sku: input.sku,
      })
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    return data;
  }

  async getProducts(filters?: { category_id?: string; subcategory_id?: string; limit?: number; offset?: number; search?: string }) {
    let query = supabase
      .from('products')
      .select('*, categories(name), subcategories(name)');

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters?.subcategory_id) {
      query = query.eq('subcategory_id', filters.subcategory_id);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    let { data, error, count } = await query
      .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 10) - 1)
      .order('created_at', { ascending: false });

    // Fallback for older schemas where subcategories table/relationship is not available yet
    if (error) {
      let fallbackQuery = supabase.from('products').select('*, categories(name)');

      if (filters?.category_id) {
        fallbackQuery = fallbackQuery.eq('category_id', filters.category_id);
      }
      if (filters?.search) {
        fallbackQuery = fallbackQuery.ilike('title', `%${filters.search}%`);
      }

      const fallback = await fallbackQuery
        .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 10) - 1)
        .order('created_at', { ascending: false });

      data = fallback.data;
      error = fallback.error;
      count = fallback.count;
    }

    if (error) throw new AppError(400, error.message);
    return { products: data || [], total: count || 0 };
  }

  async getProductById(id: string) {
    let { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        subcategories(name),
        product_variations(*),
        product_images(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      const fallback = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          product_variations(*),
          product_images(*)
        `)
        .eq('id', id)
        .single();

      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw new AppError(404, 'Product not found');
    return data;
  }

  async updateProduct(input: UpdateProductInput) {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...(input.title && { title: input.title }),
        ...(input.slug && { slug: input.slug }),
        ...(input.description && { description: input.description }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.old_price !== undefined && { old_price: input.old_price }),
        ...(input.discount_price !== undefined && { discount_price: input.discount_price }),
        ...(input.category_id && { category_id: input.category_id }),
        ...(input.subcategory_id !== undefined && { subcategory_id: input.subcategory_id }),
        ...(input.stock !== undefined && { stock: input.stock }),
        ...(input.image_url !== undefined && { image_url: input.image_url }),
        ...(input.images !== undefined && { images: input.images }),
        ...(input.sizes !== undefined && { sizes: input.sizes }),
        ...(input.colors !== undefined && { colors: input.colors }),
        ...(input.fabric !== undefined && { fabric: input.fabric }),
        ...(input.work !== undefined && { work: input.work }),
        ...(input.pieces !== undefined && { pieces: input.pieces }),
        ...(input.includes !== undefined && { includes: input.includes }),
        ...(input.care_instructions !== undefined && { care_instructions: input.care_instructions }),
        ...(input.is_new_arrival !== undefined && { is_new_arrival: input.is_new_arrival }),
        ...(input.is_on_sale !== undefined && { is_on_sale: input.is_on_sale }),
        updated_at: new Date().toISOString(),
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
    const { data, error } = await supabase
      .from('categories')
      .select('*, subcategories(*)')
      .order('name', { ascending: true });
    if (error) throw new AppError(400, error.message);
    return data || [];
  }

  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*, subcategories(*)')
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Category not found');
    return data;
  }

  async getSubcategories(categoryId?: string) {
    let query = supabase
      .from('subcategories')
      .select('*, categories(name, slug)')
      .order('name', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw new AppError(400, error.message);
    return data || [];
  }
}
