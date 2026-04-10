import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap, Star, ShieldCheck, Truck } from 'lucide-react';
import { WishlistButton } from '../wishlist/WishlistButton';

interface ProductInfoProps {
  product: any;
  onAddToCart: (product: any, variants: { size: string; color: string; quantity: number }) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Default');
  const [quantity, setQuantity] = useState(1);

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discount = product.old_price ? product.old_price - product.price : 0;

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-primary font-black tracking-widest uppercase text-xs mb-3 block">JT Collections Boutique</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">{product.title}</h1>
        </div>
        <WishlistButton productId={product.id} />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1 text-accent">
          {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
        </div>
        <span className="text-slate-400 font-bold text-sm">4.9 (128 Reviews)</span>
      </div>

      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-black text-slate-900">${product.price}</span>
        {product.old_price && (
          <>
            <span className="text-xl text-slate-400 line-through font-bold">${product.old_price}</span>
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Save ${discount}</span>
          </>
        )}
      </div>

      {isLowStock && (
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-xl w-fit"
        >
          <Zap size={14} /> ⚡ Stock Running Low: Only {product.stock} Left
        </motion.div>
      )}

      {/* VARIANTS - SIZE */}
      {product.sizes?.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Select Size</h4>
            <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((s: string) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`min-w-[56px] h-14 rounded-2xl flex items-center justify-center font-black transition-all border-2 ${
                  selectedSize === s 
                  ? 'border-slate-800 bg-slate-900 text-white shadow-xl shadow-slate-300' 
                  : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VARIANTS - COLOR */}
      {product.colors?.length > 0 && (
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Colors</h4>
          <div className="flex gap-4">
            {product.colors.map((c: string) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${
                  selectedColor === c 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-slate-100 bg-white text-slate-400'
                }`}
              >
                <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: c.toLowerCase() === 'black' ? '#000' : c.toLowerCase() === 'white' ? '#fff' : '#ddd' }} />
                <span className="font-black text-xs uppercase tracking-widest">{c}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-0 bg-white/80 backdrop-blur-xl py-6 border-t border-slate-100 -mx-4 px-4 sm:mx-0 sm:px-0 z-20">
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl h-16 w-full sm:w-40 border border-slate-200">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center font-black text-slate-500 hover:bg-white rounded-xl transition-all">-</button>
          <span className="flex-1 text-center font-black text-slate-800">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center font-black text-slate-500 hover:bg-white rounded-xl transition-all">+</button>
        </div>
        
        <button 
          onClick={() => onAddToCart(product, { size: selectedSize, color: selectedColor, quantity })}
          className="flex-1 bg-primary text-white h-16 rounded-[1.5rem] font-black tracking-widest uppercase text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300"
        >
          <ShoppingBag size={20} /> Add to Bag
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
          <Truck className="text-primary" size={24} />
          <div><h6 className="font-black text-[10px] uppercase tracking-widest">Fast Delivery</h6><p className="text-[10px] text-slate-500">Free over $150</p></div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
          <ShieldCheck className="text-primary" size={24} />
          <div><h6 className="font-black text-[10px] uppercase tracking-widest">Secure Payment</h6><p className="text-[10px] text-slate-500">100% Guaranteed</p></div>
        </div>
      </div>
    </div>
  );
};
