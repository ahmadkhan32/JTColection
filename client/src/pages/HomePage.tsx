import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category_id: string;
  stock: number;
  categories?: {
    name: string;
  };
}

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedProducts = await productService.fetchProducts({});
        setProducts((fetchedProducts as unknown as Product[])?.slice(0, 4) || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-primary/30">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO - IMMERSIVE BOUTIQUE EXPERIENCE */}
        <section className="relative h-[90vh] flex items-center overflow-hidden bg-slate-900">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2070" 
              alt="JT Collections Luxury Fashion Hero" 
              className="w-full h-full object-cover opacity-60 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
          </div>
          
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 w-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <span className="text-primary font-black tracking-[0.4em] uppercase text-xs mb-6 block">The 2026 Collection</span>
              <h1 className="text-white text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                Elegance <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 font-serif italic">Redefined.</span>
              </h1>
              <p className="text-slate-300 text-lg md:text-xl font-medium mb-12 max-w-lg leading-relaxed">
                Discover the intersection of tradition and modern luxury. Curated for the discerning individual.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/shop" className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all inline-flex items-center justify-center gap-3 shadow-2xl">
                  Shop Collection <ArrowRight size={16} />
                </Link>
                <Link to="/products?category=Suits" className="border border-white/20 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all inline-flex items-center justify-center">
                  View Lookbook
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
            <span>Scroll</span>
            <div className="w-px h-12 bg-white/20" />
            <span>Discover</span>
          </div>
        </section>

        {/* FEATURES - SUBTLE TRUST BAR */}
        <div className="bg-slate-50 py-12 border-b border-slate-100">
          <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm"><Zap size={20} /></div>
              <div><h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Rapid Fulfillment</h4><p className="text-xs text-slate-400 mt-1 font-bold italic">Nationwide Express Delivery</p></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm"><ShieldCheck size={20} /></div>
              <div><h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Hassle-Free Returns</h4><p className="text-xs text-slate-400 mt-1 font-bold italic">14-Day Boutique Exchange</p></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm"><Star size={20} /></div>
              <div><h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Master Craftsmanship</h4><p className="text-xs text-slate-400 mt-1 font-bold italic">Finest Artisanal Fabrics</p></div>
            </div>
          </div>
        </div>

        {/* CATEGORIES - LUXURY CARDS */}
        <section className="py-24 max-w-[1440px] mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] block mb-3">Curated Categories</span>
              <h2 className="text-5xl font-black text-slate-800 tracking-tighter">Boutique Pillars</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/products?category=Bridal" className="group relative h-[500px] rounded-[3rem] overflow-hidden">
                <img src="https://images.pexels.com/photos/2065162/pexels-photo-2065162.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Bridal Category" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                <div className="absolute inset-x-0 bottom-0 p-12 text-white">
                    <h3 className="text-4xl font-black tracking-tighter mb-4">Bridal</h3>
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Explore Selection <ArrowRight size={12}/></span>
                </div>
            </Link>
            <div className="space-y-8">
                <Link to="/products?category=Pret" className="group relative h-[234px] rounded-[3rem] overflow-hidden block">
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" alt="Pret-a-Porter Category" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                        <h3 className="text-2xl font-black tracking-tighter">Pret-a-Porter</h3>
                    </div>
                </Link>
                <Link to="/products?category=Formal" className="group relative h-[234px] rounded-[3rem] overflow-hidden block">
                    <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop" alt="Luxury Formal Category" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                        <h3 className="text-2xl font-black tracking-tighter">Luxury Formal</h3>
                    </div>
                </Link>
            </div>
            <Link to="/products?category=Accessories" className="group relative h-[500px] rounded-[3rem] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop" alt="Essentials Category" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                <div className="absolute inset-x-0 bottom-0 p-12 text-white">
                    <h3 className="text-4xl font-black tracking-tighter mb-4">Essentials</h3>
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Explore Selection <ArrowRight size={12}/></span>
                </div>
            </Link>
          </div>
        </section>

        {/* LATEST DROPS */}
        <section className="pb-32 max-w-[1440px] mx-auto px-6">
          <div className="mb-16 flex justify-between items-end">
            <div>
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] block mb-3">Trending Now</span>
              <h2 className="text-5xl font-black text-slate-800 tracking-tighter">Latest Arrivals</h2>
            </div>
            <Link to="/shop" className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors pb-1 border-b-2 border-slate-100 hover:border-primary">See All Gallery</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-96 bg-slate-50 animate-pulse rounded-[3rem]" />)
            ) : (
              (products || []).map(p => (
                <ProductCard 
                  key={p.id} 
                  {...p} 
                  category={p.categories?.name || 'Collection'}
                />
              ))
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};
