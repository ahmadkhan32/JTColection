import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck } from 'lucide-react';

export const SuccessPage: React.FC = () => {
  const orderRef = `JTC-${Math.floor(Math.random() * 100000)}`;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="relative mb-12">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 10 }}
                className="w-32 h-32 bg-slate-900 border-4 border-white shadow-2xl rounded-full flex items-center justify-center mx-auto"
            >
                <CheckCircle2 size={56} className="text-white" />
            </motion.div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-slate-100 rounded-full animate-ping opacity-20" />
        </div>
        
        <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Boutique Confirmation</span>
        <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-6">Your order is secured.</h1>
        <p className="text-slate-400 font-medium mb-12 max-w-md mx-auto leading-relaxed">
            Thank you for choosing JT Collections. Our artisans are now preparing your selection for delivery.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] text-left border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Order Reference</p>
                <p className="font-black text-slate-800 text-xl tracking-tighter">{orderRef}</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] text-left border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Payment Mode</p>
                <div className="flex items-center gap-2">
                    <Package size={16} className="text-primary"/>
                    <p className="font-black text-slate-800 text-xl tracking-tighter uppercase italic">Cash On Delivery</p>
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/shop" className="group bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
                Continue Shopping <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/" className="group border border-slate-200 text-slate-800 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                <ShoppingBag size={14} /> Back to Home
            </Link>
        </div>

        <div className="mt-20 flex justify-center gap-12 border-t border-slate-100 pt-12">
            <div className="flex items-center gap-3 text-slate-300">
                <Truck size={20}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Global Shipping</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 size={20}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Quality Guaranteed</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
