export const updateOrderStatus = async (supabase: any, payload: any) => {
  const { orderId, status } = payload;
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
