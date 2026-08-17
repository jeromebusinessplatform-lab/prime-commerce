import React, { createContext, useContext, useState, useCallback } from "react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

interface CartItem {
  productId: Id<"products">;
  productName: string;
  unitPrice: number;
  image?: string;
  quantity: number;
  selected: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "selected">) => void;
  updateQuantity: (productId: Id<"products">, quantity: number) => void;
  removeItem: (productId: Id<"products">) => void;
  toggleSelect: (productId: Id<"products">) => void;
  selectAll: () => void;
  deselectAll: () => void;
  clearCart: () => void;
  selectedItems: CartItem[];
  totalItems: number;
  subtotal: number;
  selectedSubtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, "selected">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { ...item, selected: true }];
    });
  }, []);

  const updateQuantity = useCallback((productId: Id<"products">, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const removeItem = useCallback((productId: Id<"products">) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const toggleSelect = useCallback((productId: Id<"products">) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, selected: !i.selected } : i))
    );
  }, []);

  const selectAll = useCallback(() => {
    setItems((prev) => prev.map((i) => ({ ...i, selected: true })));
  }, []);

  const deselectAll = useCallback(() => {
    setItems((prev) => prev.map((i) => ({ ...i, selected: false })));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const selectedItems = items.filter((i) => i.selected);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const selectedSubtotal = selectedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        toggleSelect,
        selectAll,
        deselectAll,
        clearCart,
        selectedItems,
        totalItems,
        subtotal,
        selectedSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
