import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
// import { useCart } from '../hooks/useCart';

export const Success: React.FC = () => {
  // In a real app we'd clear the cart here.
  // const { setCart } = useCart();
  // useEffect(() => { setCart([]) }, []); 

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-10 text-center border border-slate-100"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        
        <h1 className="text-4xl font-black text-primary mb-4">Payment Successful!</h1>
        <p className="text-lg text-slate-500 mb-2">Thank you for your luxurious order.</p>
        <p className="text-sm text-slate-400 mb-10">We've sent a confirmation email with your order details and tracking information.</p>

        <div className="bg-slate-50 rounded-2xl p-6 mb-10 text-left">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Order Reference</p>
          <p className="font-mono font-bold text-slate-800 text-lg">#JTC-{Math.floor(Math.random() * 100000)}</p>
        </div>

        <Link to="/shop" className="group flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-light text-white py-5 rounded-2xl font-bold text-lg transition-colors">
          Continue Shopping
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
};
