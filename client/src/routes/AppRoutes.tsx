import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Products } from '../pages/Products';
import { Wishlist } from '../pages/Wishlist';
import { ProductDetails } from '../pages/ProductDetails';
import { Checkout } from '../pages/Checkout';
import { Success } from '../pages/Success';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';

// Admin Imports
import { AdminLayout } from '../pages/admin/AdminLayout';
import { Dashboard } from '../pages/admin/Dashboard';
import { AdminProducts } from '../pages/admin/Products';
import { AdminCategories } from '../pages/admin/Categories';
import { AdminOrders } from '../pages/admin/Orders';
import { AdminUsers } from '../pages/admin/Users';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Products />} />
      <Route path="/products" element={<Products />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<Success />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Admin Panel */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
