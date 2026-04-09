import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/product/ProductCard';
import { FadeIn } from '../components/animations/FadeIn';
import { SlideUp } from '../components/animations/SlideUp';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { supabase } from '../services/supabaseClient';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In local development before Supabase keys are active, we mock the fetch or attempt it seamlessly.
    const fetchFeatures = async () => {
      try {
        if (!supabase) throw new Error("No supabase");
        const { data } = await supabase.from('products').select('*').limit(4);
        if (data && data.length > 0) {
          setProducts(data);
        } else {
           setProducts([
            { id: '1', title: 'Luxury Silk Dress', price: 95, category: 'Women', image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d' },
            { id: '2', title: 'Modern Abaya', price: 80, category: 'Women', image_url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03' },
            { id: '3', title: 'Elegant Party Gown', price: 150, category: 'Women', image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956' },
            { id: '4', title: 'Casual Denim Jacket', price: 60, category: 'Women', image_url: 'https://images.unsplash.com/photo-1542060748-10c28b62716f' }
          ]);
        }
      } catch (err) {
        // Fallback demo data
        setProducts([
          { id: '1', title: 'Luxury Silk Dress', price: 95, category: 'Women', image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d' },
          { id: '2', title: 'Modern Abaya', price: 80, category: 'Women', image_url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03' },
          { id: '3', title: 'Elegant Party Gown', price: 150, category: 'Women', image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956' },
          { id: '4', title: 'Casual Denim Jacket', price: 60, category: 'Women', image_url: 'https://images.unsplash.com/photo-1542060748-10c28b62716f' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatures();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Full-Width Hero Section */}
        <div className="relative h-[80vh] min-h-[600px] w-full bg-slate-900 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d" 
            alt="Hero Fashion" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40" />
          
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <SlideUp duration={0.8} yOffset={50}>
              <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">New Collection 2026</span>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 max-w-3xl">
                Redefine Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover">Aesthetic.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed">
                Discover the latest trends in luxury fashion. Express yourself with unmatched quality and pristine modern design.
              </p>
              
              <Link to="/shop" className="group flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-accent-hover transition-all w-fit duration-300">
                Shop The Collection
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </SlideUp>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            
          {/* Featured Categories */}
          <FadeIn delay={0.2} className="mb-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-slate-800">Shop by Category</h2>
              <Link to="/shop" className="text-primary hover:text-primary-dark font-semibold flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Dresses', img: 'https://images.unsplash.com/photo-1520975916090-3105956dac38' },
                { name: 'Abaya', img: 'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1' },
                { name: 'Jackets', img: 'https://images.unsplash.com/photo-1542060748-10c28b62716f' },
                { name: 'Accessories', img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809' },
              ].map((cat, i) => (
                <Link key={i} to={`/shop?category=${cat.name.toLowerCase()}`} className="group relative h-80 rounded-2xl overflow-hidden block">
                  <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-white font-bold text-xl uppercase tracking-wider">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>

          {/* Featured Products */}
          <SlideUp delay={0.4}>
            <div className="text-center mb-12">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">Featured</span>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">Trending Now</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-12">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map(p => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            )}
            
            <div className="mt-16 flex justify-center">
              <Link to="/shop" className="border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary px-8 py-3 rounded-full font-bold transition-colors">
                Load More Products
              </Link>
            </div>
          </SlideUp>

        </div>

      </main>
      <Footer />
    </div>
  );
};
