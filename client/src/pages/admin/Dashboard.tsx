import React, { useEffect, useState } from 'react';
import { Users, ShoppingBag, DollarSign, Package, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalRevenue: '0.00',
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getAnalytics();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { name: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: <DollarSign className="text-green-500" />, trend: '+12.5%', color: 'from-green-500/10 to-transparent' },
    { name: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag className="text-blue-500" />, trend: '+8.2%', color: 'from-blue-500/10 to-transparent' },
    { name: 'Total Users', value: stats.totalUsers, icon: <Users className="text-purple-500" />, trend: '+14.1%', color: 'from-purple-500/10 to-transparent' },
    { name: 'Inventory Count', value: stats.totalProducts, icon: <Package className="text-amber-500" />, trend: '+2.4%', color: 'from-amber-500/10 to-transparent' },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 font-medium">Global analytics and performance monitoring</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Real-time stats</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {cards.map((card, i) => (
          <div key={i} className={`bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500`}>
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:scale-110 transition-transform duration-500">
                  {card.icon}
                </div>
                <div className="flex items-center gap-1 text-green-500 font-black text-xs bg-green-50 px-2 py-1 rounded-lg">
                  <ArrowUpRight size={12} />
                  {card.trend}
                </div>
              </div>
              <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{card.name}</p>
                <p className="text-3xl font-black text-slate-800 tracking-tight tracking-tight">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for chart */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-slate-50/50 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #000 0.5px, transparent 1px)', backgroundSize: '24px 24px' }} />
         <div className="relative z-10 text-center">
            <TrendingUp size={48} className="text-slate-200 mb-4 mx-auto" />
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Revenue Analytics</h3>
            <p className="text-slate-300 text-sm mt-2">Historical trends visualization</p>
         </div>
      </div>
    </div>
  );
};

