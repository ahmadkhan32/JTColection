import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem as ICartItem } from '../../context/CartContext';
import { useCart } from '../../hooks/useCart';

export const CartItem: React.FC<{ item: ICartItem }> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 border border-slate-100 bg-white p-3 rounded-2xl shadow-sm">
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">{item.title}</h4>
          <button 
            onClick={() => removeFromCart(item.id, item.selectedSize || '', item.selectedColor || '', item.cart_id)}
            className="text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="flex justify-between items-end">
          <p className="font-bold text-primary">${item.price.toFixed(2)}</p>
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-100">
            <button 
              onClick={() => updateQuantity(item.id, item.selectedSize || '', item.selectedColor || '', item.cart_id, item.quantity - 1)}
              className="p-1 hover:bg-white rounded-md text-slate-500 transition-colors hover:shadow-sm"
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
            <button 
              onClick={() => updateQuantity(item.id, item.selectedSize || '', item.selectedColor || '', item.cart_id, item.quantity + 1)}
              className="p-1 hover:bg-white rounded-md text-slate-500 transition-colors hover:shadow-sm"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
