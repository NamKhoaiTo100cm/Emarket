import { apiFetch } from "@/lib/api";

export const cartService = {
    /** Lấy giỏ hàng từ server */
    getCart: () => apiFetch('/cart', {}, true),

    /** Thêm sản phẩm vào giỏ */
    addToCart: (productId: number, variantId?: number, quantity: number = 1) =>
        apiFetch('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, variantId, quantity }),
        }),

    /** Cập nhật số lượng 1 item */
    updateQuantity: (cartItemId: number, quantity: number) =>
        apiFetch(`/cart/${cartItemId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity }),
        }),

    /** Xóa 1 item */
    removeFromCart: (cartItemId: number) =>
        apiFetch(`/cart/${cartItemId}`, { method: 'DELETE' }),

    /** Xóa toàn bộ giỏ hàng */
    clearCart: () => apiFetch('/cart', { method: 'DELETE' }),
};
