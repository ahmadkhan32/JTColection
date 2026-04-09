import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { supabase } from '../services/supabaseClient';
import { createPaymentOrder, verifyPayment } from '../services/paymentService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout: React.FC = () => {
  const { cart, cartTotal, setIsCartOpen, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Close cart drawer if open
  React.useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Your Cart is Empty</h1>
        <p className="text-slate-500 mb-8">You need items in your cart to checkout.</p>
        <Link to="/shop" className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-full font-bold transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  const tax = cartTotal * 0.08;
  const shipping = cartTotal > 200 ? 0 : 15;
  const finalTotal = cartTotal + tax + shipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (user) {
        // Push order to Supabase
        const { data: order, error: orderError } = await supabase.from('orders').insert({
          user_id: user.id,
          total_price: finalTotal,
          status: 'pending',
          payment_status: 'pending',
        }).select().single();

        if (order && !orderError) {
          const itemsToInsert = cart.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
          }));
          await supabase.from('order_items').insert(itemsToInsert);

          // Invoke Razorpay Integration
          const rzpOrder = await createPaymentOrder(finalTotal * 100);
          
          if (window.Razorpay) {
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_mockkey',
              amount: finalTotal * 100, // paise
              currency: 'INR',
              name: 'JT Collections',
              description: 'Luxury Fashion Order',
              order_id: rzpOrder.id !== undefined && rzpOrder.id.startsWith('order') ? undefined : rzpOrder.id, // Only attach if real razorpay order
              handler: async function (response: any) {
                // Verify payment securely
                await verifyPayment(response);
                
                await supabase.from('orders').update({
                  payment_status: 'paid',
                  status: 'processing'
                }).eq('id', order.id);
                
                await supabase.from('cart').delete().eq('user_id', user.id);
                await fetchCart();
                setLoading(false);
                navigate('/success');
              },
              prefill: { email: user.email },
              theme: { color: '#0F172A' },
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function () {
              setLoading(false);
              alert('Payment Failed! Please try again.');
            });
            rzp.open();
            return; // exit early to prevent immediate fake success navigate
          }
        }
      }
      
      // Navigate to success if guest or fallback local mock runs
      setTimeout(() => {
        setLoading(false);
        navigate('/success');
      }, 1000);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center justify-between">
          <Link to="/shop" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium">
            <ArrowLeft size={20} /> Back to Shop
          </Link>
          <div className="flex items-center gap-2 text-accent font-semibold">
            <ShieldCheck size={20} /> Secure Checkout
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Forms */}
          <div className="flex-1 order-2 lg:order-1">
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCheckout} 
              className="space-y-8"
            >
              
              {/* Contact Info */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-primary mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2"><Truck size={24}/> Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Postal Code</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
                  </div>
                </div>
              </div>

              {/* Payment Mock */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2"><CreditCard size={24}/> Payment</h2>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 mb-6 flex items-start gap-4">
                   <ShieldCheck className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                   <div>
                     <p className="font-semibold text-blue-900">This is a mock checkout system.</p>
                     <p className="text-sm text-blue-700 mt-1">In production, Stripe Elements or Razorpay UI will render here.</p>
                   </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-light text-white py-5 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(15,23,42,0.3)] disabled:opacity-70"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    `Pay $${finalTotal.toFixed(2)}`
                  )}
                </button>
              </div>

            </motion.form>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-96 flex-shrink-0 order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-24"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-lg object-cover bg-slate-50" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-slate-800 line-clamp-1">{item.title}</h4>
                      <p className="text-slate-500 text-xs mt-1">Qty: {item.quantity}</p>
                      <p className="font-bold text-primary text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100 text-sm font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-800">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-slate-800">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="text-slate-800">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 mt-6 border-t border-slate-100">
                <span className="text-lg font-bold text-slate-800">Total</span>
                <span className="text-3xl font-black text-accent">${finalTotal.toFixed(2)}</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};
