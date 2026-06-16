import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import { useUser } from "./UserContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useUser();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async (showLoading = true) => {
    if (!user || user.role !== "user") return;
    try {
      if (showLoading) setLoading(true);
      const data = await api.get("/cart-api/");
      setCart(data.cart);
    } catch {
      setCart(null);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart(true);
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    await api.post("/cart-api/add", { productId, quantity });
    await fetchCart(false);
  };

  const updateQuantity = async (productId, quantity) => {
    await api.put("/cart-api/update", { productId, quantity });
    await fetchCart(false);
  };

  const removeFromCart = async (productId) => {
    await api.delete(`/cart-api/remove/${productId}`);
    await fetchCart(false);
  };

  const clearLocalCart = () => setCart(null);

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, fetchCart, addToCart, updateQuantity, removeFromCart, clearLocalCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
