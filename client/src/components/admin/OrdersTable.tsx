import React from 'react';
import { Eye, Truck, CheckCircle, Clock } from 'lucide-react';

interface OrdersTableProps {
  orders: any[];
  onUpdateStatus: (id: string, status: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onUpdateStatus }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'processing': return <Clock size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">Order ID</th>
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">Customer</th>
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">Total Price</th>
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">Payment</th>
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">System Status</th>
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                <td className="p-6">
                  <span className="font-mono text-xs text-slate-400">#{o.id.split('-')[0]}</span>
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{o.profiles?.name || 'Guest User'}</span>
                    <span className="text-xs text-slate-400">{o.profiles?.email || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="font-black text-primary">${o.total_price}</span>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    o.payment_status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {o.payment_status}
                  </span>
                </td>
                <td className="p-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(o.status)}`}>
                    {getStatusIcon(o.status)}
                    <span className="capitalize">{o.status}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <select 
                      value={o.status} 
                      onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer hover:border-slate-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
