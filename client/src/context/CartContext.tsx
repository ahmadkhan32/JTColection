import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export interface CartItem {
  id: string; // product id or mock cart id
  product_id?: string;
  title: string;
  price: number;
  image_url: string;
  quantity: number;
  cart_id?: string; // Real cart DB id
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string, cart_id?: string) => Promise<void>;
  updateQuantity: (id: string, cart_id: string | undefined, quantity: number) => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  cartTotal: number;
  cartCount: number;
  fetchCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('jt_brand_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return; // fallback to local storage naturally
    
    // Attempt fetch from DB
    const { data, error } = await supabase
      .from('cart')
      .select('*, products(id, title, price, image_url)')
      .eq('user_id', user.id);
      
    if (data && !error) {
      const items = data.map((item: any) => ({
        cart_id: item.id,
        id: item.products.id,
        product_id: item.products.id,
        title: item.products.title,
        price: item.products.price,
        quantity: item.quantity,
        image_url: item.products.image_url,
      }));
      setCart(items);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    localStorage.setItem('jt_brand_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (item: CartItem) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (user) {
      // Sync to supabase
      const { data: existing } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', item.id)
        .single();
        
      if (existing) {
        await supabase.from('cart').update({ quantity: existing.quantity + (item.quantity || 1) }).eq('id', existing.id);
      } else {
        await supabase.from('cart').insert({ user_id: user.id, product_id: item.id, quantity: item.quantity || 1 });
      }
      await fetchCart();
    } else {
      // Local fallback
      setCart((prev) => {
        const existing = prev.find(p => p.id === item.id);
        if (existing) {
          return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
        }
        return [...prev, { ...item, quantity: 1 }];
      });
    }
    setIsCartOpen(true);
  };

  const removeFromCart = async (id: string, cart_id?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && cart_id) {
      await supabase.from('cart').delete().eq('id', cart_id);
      await fetchCart();
    } else {
      setCart((prev) => prev.filter(p => p.id !== id));
    }
  };

  const updateQuantity = async (id: string, cart_id: string | undefined, quantity: number) => {
    if (quantity < 1) return;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user && cart_id) {
      await supabase.from('cart').update({ quantity }).eq('id', cart_id);
      await fetchCart();
    } else {
      setCart((prev) => prev.map(p => p.id === id ? { ...p, quantity } : p));
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, cartTotal, cartCount, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
