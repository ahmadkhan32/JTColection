import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { supabase } from '../services/supabaseClient';
import { orderService } from '../services/orderService';
import { CheckoutForm } from '../components/checkout/CheckoutForm';

export const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, setIsCartOpen, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-black text-slate-800 mb-4">Cart is Empty</h1>
        <p className="text-slate-500 mb-8 max-w-sm">Add some luxury pieces to your collection before checking out.</p>
        <Link to="/shop" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">Explore Boutique</Link>
      </div>
    );
  }

  const shipping = cartTotal > 500 ? 0 : 50;
  const finalTotal = cartTotal + shipping;

  const handleCODOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const orderPayload = {
        user_id: session?.user?.id || null,
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        total_amount: finalTotal,
        status: 'pending'
      };

      await orderService.placeOrder(orderPayload, cart);

      await clearCart();
      setTimeout(() => {
        setLoading(false);
        navigate('/success');
      }, 1500);

    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-[1440px] mx-auto px-6">
        
        <div className="mb-12 flex items-center justify-between">
          <Link to="/shop" className="inline-flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-primary transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Boutique
          </Link>
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
            <ShieldCheck size={16} /> Secure COD Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div>
                <span className="text-primary font-black tracking-widest uppercase text-xs block mb-3">Confirmation</span>
                <h2 className="text-5xl font-black text-slate-800 tracking-tight mb-8">Shipping Boutique</h2>
                
                <CheckoutForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  onSubmit={handleCODOrder} 
                  loading={loading}
                />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-50 p-10 rounded-[3.5rem] sticky top-24 border border-slate-100"
            >
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-8 uppercase text-xs tracking-[0.2em] border-b border-slate-200 pb-6">Your Selection</h2>
              
              <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto no-scrollbar">
                {cart.map(item => {
                  const itemKey = `${item.id}-${item.selectedSize || 'no-size'}-${item.selectedColor || 'no-color'}`;
                  return (
                    <div key={itemKey} className="flex gap-6 items-center">
                      <div className="w-20 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-white shadow-sm border border-slate-100">
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800 text-sm line-clamp-1">{item.title}</h4>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                          {item.selectedSize || 'Standard'} / {item.selectedColor || 'Default'}
                        </p>
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-slate-400 text-xs font-bold">Qty: {item.quantity}</span>
                          <span className="font-black text-slate-800 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-800">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                  <span>Shipping</span>
                  <span className="text-slate-800">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                
                <div className="flex justify-between items-end pt-8 mt-8 border-t border-slate-800">
                    <span className="text-lg font-black text-slate-800 uppercase tracking-tighter">Total Amount</span>
                    <span className="text-4xl font-black text-primary tracking-tighter">${finalTotal.toFixed(2)}</span>
                </div>

                <button 
                  form="cod-form"
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:bg-black group disabled:opacity-50 mt-10"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Confirm COD Order <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};
