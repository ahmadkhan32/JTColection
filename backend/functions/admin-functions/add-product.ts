import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const addProduct = async (supabase: any, payload: any) => {
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
};
