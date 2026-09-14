import { create } from 'zustand';

interface CartState {
    itemCount: number;
    setItemCount: (count: number) => void;
    increment: (amount?: number) => void;
    clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    itemCount: 0,
    setItemCount: (itemCount) => set({ itemCount }),
    increment: (amount = 1) => set((state) => ({ itemCount: state.itemCount + amount })),
    clear: () => set({ itemCount: 0 }),
}));
