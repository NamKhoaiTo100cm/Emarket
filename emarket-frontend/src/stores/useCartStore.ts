"use client"
import { CartStore } from "@/types/cartstore";
import { cartService } from "@/services/cart.service";
import { toast } from "sonner";
import { create } from "zustand";

export const useCartStore = create<CartStore>((set, get) => ({
    productItems: [],
    loading: false,

    /**
     * Khởi tạo giỏ hàng từ server.
     * Gọi khi user đã đăng nhập (trong layout hoặc sau login).
     */
    initCart: async () => {
        try {
            set({ loading: true });
            const res = await cartService.getCart();
            set({ productItems: res.data ?? [] });
        } catch {
            // Nếu chưa đăng nhập hoặc lỗi → giỏ hàng rỗng
            set({ productItems: [] });
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Thêm vào giỏ hàng.
     * - Nếu chưa đăng nhập: toast cảnh báo + gọi redirectToLogin()
     * - Nếu đã đăng nhập: gọi API
     */
    addToCart: async (productId, variant, isLoggedIn, redirectToLogin) => {
        if (!isLoggedIn) {
            toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng");
            redirectToLogin?.();
            return;
        }

        try {
            const res = await cartService.addToCart(productId, variant?.id);
            const newItem = res.data;

            set((state) => {
                // Nếu item đã tồn tại (cùng cartItemId) → update quantity
                const exists = state.productItems.some((p) => p.id === newItem.id);
                if (exists) {
                    return {
                        productItems: state.productItems.map((p) =>
                            p.id === newItem.id ? newItem : p
                        ),
                    };
                }
                return { productItems: [newItem, ...state.productItems] };
            });

            toast.success("Đã thêm vào giỏ hàng");
        } catch (err: any) {
            toast.error(err?.message || "Không thể thêm vào giỏ hàng");
        }
    },

    updateQuantity: async (cartItemId, quantity) => {
        try {
            if (quantity <= 0) {
                await get().removeFromCart(cartItemId);
                return;
            }
            await cartService.updateQuantity(cartItemId, quantity);
            set((state) => ({
                productItems: state.productItems.map((p) =>
                    p.id === cartItemId ? { ...p, quantity } : p
                ),
            }));
        } catch (err: any) {
            toast.error(err?.message || "Không thể cập nhật số lượng");
        }
    },

    removeFromCart: async (cartItemId) => {
        try {
            await cartService.removeFromCart(cartItemId);
            set((state) => ({
                productItems: state.productItems.filter((p) => p.id !== cartItemId),
            }));
            toast.success("Đã xóa khỏi giỏ hàng");
        } catch (err: any) {
            toast.error(err?.message || "Không thể xóa sản phẩm");
        }
    },

    clearCart: async () => {
        try {
            await cartService.clearCart();
            set({ productItems: [] });
        } catch {
            // ignore
        }
    },
}));