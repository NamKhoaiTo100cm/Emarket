"use client"
import { CartStore } from "@/types/cartstore";
import { toast } from "sonner";
import { create } from "zustand";

export const useCartStore = create<CartStore>((set, get) => ({
    productItems: [],

    initCart: () => {
        const data = JSON.parse(localStorage.getItem("cart") || "[]");
        set({ productItems: data || [] });
    },

    addToCart: (id, variant) => {
        const productItems = get().productItems;
        // Nếu có variant thì key là productId+variantId, nếu không thì chỉ productId
        const existing = variant
            ? productItems.find(p => p.id === id && p.variantId === variant.id)
            : productItems.find(p => p.id === id && !p.variantId);

        if (existing) {
            toast.error("Sản phẩm đã có trong giỏ hàng");
            return;
        }

        const newItem = variant
            ? { id, quantity: 1, variantId: variant.id, variantName: variant.name, variantPrice: variant.price }
            : { id, quantity: 1 };

        const newItems = [...productItems, newItem];
        localStorage.setItem("cart", JSON.stringify(newItems));
        set({ productItems: newItems });
        toast.success("Đã thêm vào giỏ hàng");
    },

    updateQuantity: (id, quantity, variantId) => {
        const newItems = get().productItems.map(p =>
            p.id === id && p.variantId === variantId ? { ...p, quantity } : p
        );
        localStorage.setItem("cart", JSON.stringify(newItems));
        set({ productItems: newItems });
    },

    removeFromCart: (id, variantId) => {
        const newItems = get().productItems.filter(p =>
            !(p.id === id && p.variantId === variantId)
        );
        localStorage.setItem("cart", JSON.stringify(newItems));
        set({ productItems: newItems });
    },

    clearCart: () => {
        localStorage.setItem("cart", "[]");
        set({ productItems: [] });
    }
}));