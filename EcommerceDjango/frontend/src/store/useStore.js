import { create } from "zustand";

export const useStore = create((set, get) => ({
  compare: [],
  cart: [],
  cartCount: 0,
  authUser: localStorage.getItem("authUser") || "",
  theme: "dark",
  searchTerm: "",
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setAuthUser: (authUser) => set({ authUser }),
  setCart: (cart) => set({ cart }),
  setCartCount: (cartCount) => set({ cartCount }),
  addToCompare: (product) => {
    const compare = get().compare;
    const exists = compare.find((p) => p.id === product.id);
    if (exists) return;
    if (compare.length >= 3) return;
    set({ compare: [...compare, product] });
  },
  removeFromCompare: (id) => {
    set((state) => ({ compare: state.compare.filter((p) => p.id !== id) }));
  },
  addToCart: (product) => {
    const cart = get().cart;
    const found = cart.find((item) => item.id === product.id);
    if (found) {
      set({
        cart: cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      });
      return;
    }
    set({ cart: [...cart, { ...product, quantity: 1 }] });
  },
  updateQty: (id, quantity) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Number(quantity || 1)) }
          : item,
      ),
    }));
  },
  removeFromCart: (id) => {
    set((state) => ({ cart: state.cart.filter((item) => item.id !== id) }));
  },
  clearCart: () => set({ cart: [] }),
}));
