import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/product/ProductCard';
import { ProductFilters } from '../components/product/ProductFilters';
import { useSearch } from '../hooks/useSearch';
import { useProducts } from '../hooks/useProducts';

export const Products: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';

  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch(400);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  
  const { products, loading, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts(debouncedSearch, category, minPrice, maxPrice);
  }, [debouncedSearch, category, minPrice, maxPrice]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800">Shop Collection</h1>
            <p className="text-slate-500 mt-2">Discover the perfect piece for your aesthetic.</p>
          </div>
          
          <div className="relative w-full md:max-w-md">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters 
              category={category}
              setCategory={setCategory}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
            />
          </div>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : products.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {products.map(p => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </motion.div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100">
                <p className="text-xl font-bold text-slate-700 mb-2">No products found</p>
                <p className="text-slate-500">Try adjusting your filters or search term.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setCategory(''); setMinPrice(undefined); setMaxPrice(undefined); }}
                  className="mt-6 text-primary font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};
