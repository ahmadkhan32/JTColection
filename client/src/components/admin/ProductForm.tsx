import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { supabase } from '../../services/supabaseClient';

interface ProductFormProps {
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    price: product?.price || 0,
    old_price: product?.old_price || 0,
    stock: product?.stock || 0,
    category_id: product?.category_id || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    sizes: product?.sizes?.join(', ') || '',
    colors: product?.colors?.join(', ') || '',
  });
  
  const [categories, setCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    adminService.fetchCategories().then(setCategories);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('jt-brand-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('jt-brand-assets')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (err) {
      alert('Error uploading image!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      };

      if (product?.id) {
        await adminService.updateProduct(product.id, payload);
      } else {
        await adminService.createProduct(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert('Error saving product');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{product ? 'Update Premium Listing' : 'Create Premium Listing'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
                placeholder="Ex: JT Premium Oversized Hoodie"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
              <select 
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Quantity</label>
              <input 
                required
                type="number" 
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selling Price ($)</label>
              <input 
                required
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold text-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Original Price ($)</label>
              <input 
                type="number" 
                value={formData.old_price}
                onChange={(e) => setFormData({ ...formData, old_price: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sizes (Comma separated)</label>
              <input 
                type="text" 
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
                placeholder="Ex: S, M, L, XL"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Colors (Comma separated)</label>
              <input 
                type="text" 
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
                placeholder="Ex: Black, White, Beige"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Luxury Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all resize-none font-medium"
              placeholder="Tell us about the craftsmanship..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visual Assets</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative border-2 border-dashed border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-primary/50 transition-colors group cursor-pointer bg-slate-50">
                <input 
                  type="file" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                />
                <Upload className="text-slate-300 group-hover:text-primary mb-2" />
                <span className="text-[10px] text-slate-400 group-hover:text-primary font-black uppercase tracking-widest">
                  {uploading ? 'Processing Image...' : 'Click to upload HD Asset'}
                </span>
              </div>
              {formData.image_url && (
                <div className="h-28 w-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={uploading}
              className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-primary text-white hover:bg-primary-light transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {product ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
