import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { CartItem } from '@/services/api/types';

// Cart context interface
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Ensure cart item has a valid ID
const ensureValidId = (item: CartItem): CartItem => {
  // If id is null, undefined, or NaN, generate a unique ID
  if (item.id === null || item.id === undefined || isNaN(item.id)) {
    return {
      ...item,
      id: Date.now() + Math.floor(Math.random() * 1000)
    };
  }
  return item;
};

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('mediwrap-cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        // Ensure all items have valid IDs
        const validatedCart = parsedCart.map(ensureValidId);
        setCartItems(validatedCart);
      } catch (error) {
        console.error('Failed to parse stored cart data');
        localStorage.removeItem('mediwrap-cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mediwrap-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart - using useCallback to prevent unnecessary re-renders
  const addToCart = useCallback((item: CartItem) => {
    // Ensure item has a valid ID
    const validItem = ensureValidId(item);
    
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.id === validItem.id);
      
      if (existingItemIndex >= 0) {
        // If item exists, increase quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + validItem.quantity
        };
        
        return updatedItems;
      } else {
        // If item doesn't exist, add it
        return [...prevItems, validItem];
      }
    });
    
    // Show toast outside of state update
    setTimeout(() => {
      toast({
        title: "Item added to cart",
        description: `${item.name} has been added to your cart`,
      });
    }, 0);
  }, [toast]);
  
  // Remove item from cart - using useCallback to prevent unnecessary re-renders
  const removeFromCart = useCallback((id: number) => {
    // Skip invalid IDs
    if (id === null || id === undefined || isNaN(id)) return;
    
    let itemName = "";
    
    // First get the item name before removing
    const itemToRemove = cartItems.find(item => item.id === id);
    if (itemToRemove) {
      itemName = itemToRemove.name;
    }
    
    setCartItems(prevItems => {
      return prevItems.filter(cartItem => cartItem.id !== id);
    });
    
    // Show toast outside of state update
    if (itemName) {
      setTimeout(() => {
        toast({
          title: "Item removed",
          description: `${itemName} has been removed from your cart`,
        });
      }, 0);
    }
  }, [cartItems, toast]);
  
  // Update item quantity - using useCallback to prevent unnecessary re-renders
  const updateQuantity = useCallback((id: number, quantity: number) => {
    // Skip invalid IDs
    if (id === null || id === undefined || isNaN(id)) return;
    if (quantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, []);
  
  // Clear cart - using useCallback to prevent unnecessary re-renders
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('mediwrap-cart');
    
    // Show toast outside of state update
    setTimeout(() => {
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    }, 0);
  }, [toast]);
  
  // Calculate total items and subtotal
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      totalItems,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for using cart
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
