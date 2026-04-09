import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { WishlistButton } from '../components/wishlist/WishlistButton';

export const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find((p: any) => p.id === id);
      if (found) {
        setProduct(found);
      }
      setLoading(false);
    }
  }, [id, products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-slate-800">Product Not Found</h1>
          <Link to="/shop" className="mt-4 text-primary hover:underline">Return to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <Link to="/shop" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: HD Image Viewer */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden shadow-sm relative">
              <WishlistButton productId={product.id} />
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails placeholder */}
            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
              {[product.image_url, product.image_url, product.image_url].map((img, idx) => (
                <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer transition-colors flex-shrink-0">
                  <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Product Meta */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2">{product.categories?.name || product.category}</span>
            <h1 className="text-4xl lg:text-5xl font-black text-primary leading-tight mb-4">{product.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-accent">
                {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <span className="text-slate-500 text-sm">(128 Reviews)</span>
            </div>

            <p className="text-3xl font-bold text-slate-800 mb-8">${product.price.toFixed(2)}</p>

            <p className="text-slate-600 text-lg leading-relaxed mb-10">
              {product.description || "This stunning piece perfectly captures modern luxury. Crafted with premium materials for maximum comfort and style."}
            </p>

            <div className="flex items-end gap-6 mb-10 border-t border-b border-slate-200 py-8">
              <div>
                <span className="block text-sm font-semibold text-slate-700 mb-3">Quantity</span>
                <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-2 w-32">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">-</button>
                  <span className="flex-1 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">+</button>
                </div>
              </div>
              
              <button 
                onClick={() => addToCart({...product, quantity})}
                className="flex-1 bg-accent hover:bg-accent-hover text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-[0_8px_20px_rgb(245,158,11,0.3)] hover:shadow-[0_8px_25px_rgb(245,158,11,0.5)] transform hover:-translate-y-1"
              >
                <ShoppingBag size={22} /> Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                <Truck className="text-accent flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Free Shipping</h4>
                  <p className="text-slate-500 text-xs mt-1">Orders over $200</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                <ShieldCheck className="text-accent flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Secure Checkout</h4>
                  <p className="text-slate-500 text-xs mt-1">100% Protected</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
