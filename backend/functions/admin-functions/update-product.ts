export const updateProduct = async (supabase: any, payload: any) => {
  const { id, data } = payload;
  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id);

  if (error) throw error;
  return { message: "Updated Successfully" };
};
