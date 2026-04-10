import React, { useState } from 'react';
import { Truck, CheckCircle, Clock, Smartphone, MapPin, Package, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  products?: {
    title: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  total_amount: number;
  status: string;
  order_items?: OrderItem[];
}

interface OrdersTableProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onUpdateStatus }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'confirmed': return <Package size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 w-16">Item</th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Customer Details</th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Location</th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Total Price</th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Payment</th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Status</th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map(o => (
              <React.Fragment key={o.id}>
                <tr className={`border-b border-slate-50 hover:bg-slate-50/30 transition-colors ${expandedRow === o.id ? 'bg-slate-50/50' : ''}`}>
                  <td className="p-6">
                    <button 
                        onClick={() => setExpandedRow(expandedRow === o.id ? null : o.id)}
                        className="p-3 bg-slate-50 rounded-xl hover:bg-primary hover:text-white transition-all"
                        aria-label={expandedRow === o.id ? "Hide details" : "Show details"}
                    >
                        {expandedRow === o.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 tracking-tight">{o.customer_name}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Smartphone size={12}/> {o.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-600 text-xs">{o.city}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <MapPin size={10}/> {o.address}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-black text-primary">${o.total_amount}</span>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                       Cash On Delivery
                    </span>
                  </td>
                  <td className="p-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(o.status)}`}>
                      {getStatusIcon(o.status)}
                      <span className="capitalize">{o.status}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <select 
                        value={o.status} 
                        onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </td>
                </tr>
                {expandedRow === o.id && (
                    <tr className="bg-slate-50/30">
                        <td colSpan={7} className="p-8">
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Order Items & Specifications</h4>
                                <div className="space-y-4">
                                    {(o.order_items || []).map((item) => (
                                        <div key={item.id} className="flex items-center gap-6 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                            <div className="w-12 h-16 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={item.products?.image_url} alt={item.products?.title || "Product"} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-slate-800 text-sm">{item.products?.title}</p>
                                                <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    <span>Size: {item.size}</span>
                                                    <span>Color: {item.color}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-800 text-sm">${item.price}</p>
                                                <p className="text-[10px] font-bold text-slate-400">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
