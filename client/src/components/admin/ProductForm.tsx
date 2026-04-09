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
    stock: product?.stock || 0,
    category_id: product?.category_id || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
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

    const { error: uploadError } = await supabase.storage
      .from('jt-brand-assets')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error uploading image!');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('jt-brand-assets')
      .getPublicUrl(filePath);

    setFormData({ ...formData, image_url: publicUrl });
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (product?.id) {
        await adminService.updateProduct(product.id, formData);
      } else {
        await adminService.createProduct(formData);
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
          <h2 className="text-xl font-bold text-slate-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Product Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all"
                placeholder="Ex: Luxury Silk Dress"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Category</label>
              <select 
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Price ($)</label>
              <input 
                required
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Stock Quantity</label>
              <input 
                required
                type="number" 
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all resize-none"
              placeholder="Tell us about this product..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Product Image</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-accent transition-colors group cursor-pointer">
                <input 
                  type="file" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                />
                <Upload className="text-slate-300 group-hover:text-accent mb-2" />
                <span className="text-xs text-slate-400 group-hover:text-accent font-medium">
                  {uploading ? 'Uploading...' : 'Click to upload HD image'}
                </span>
              </div>
              {formData.image_url && (
                <div className="h-24 w-24 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
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
