import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { OrdersTable } from '../../components/admin/OrdersTable';
import { Loader2 } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      // In a real app, this would be adminService.fetchOrders()
      // For now we use the existing specific query pattern
      const { data } = await adminService.fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateOrderStatus(id, status);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Order Management</h1>
        <p className="text-slate-500 font-medium">Review and process customer transactions</p>
      </div>

      <OrdersTable orders={orders} onUpdateStatus={updateStatus} />
    </div>
  );
};
