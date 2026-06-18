import { apiFetch } from "@/lib/api";

export const orderService = {
    findByShopId: (shopId: number, page = 1, limit = 10) =>
        apiFetch(`/order/shop/${shopId}?page=${page}&limit=${limit}`),
    createOrder: (data: any) =>
        apiFetch("/order", { method: "POST", body: JSON.stringify(data) }),
    getPaymentStatus: (orderId: number) =>
        apiFetch(`/order/payment-status/${orderId}`, {
            method: "GET"
        }),

    sellerUpdateOrderStatus: (orderId: number, status: 'confirmed' | 'cancelled' | 'shipping') =>
        apiFetch(`/order/seller-update-order/${orderId}`, {
            method: "PATCH",
            body: JSON.stringify({ status })
        }),
    userConfirmDelivery: (orderId: number) =>
        apiFetch(`/order/user-confirm-delivery/${orderId}`, {
            method: "PATCH",
        }),
    userCancelOrder: (orderId: number) =>
        apiFetch(`/order/user-cancel-order/${orderId}`, {
            method: "PATCH",
        }),
    findByUserId: (page = 1, limit = 10) =>
        apiFetch(`/order/user?page=${page}&limit=${limit}`),

    getOrderById: (id: number) =>
        apiFetch(`/order/${id}`),

    createReturnRequest: (orderId: number, formData: FormData) =>
        apiFetch(`/order/${orderId}/return`, {
            method: "POST",
            body: formData
        }),

    getReturnRequests: (status?: string) =>
        apiFetch(`/order/admin/returns${status ? `?status=${status}` : ""}`),

    resolveReturnRequest: (id: number, status: "APPROVED" | "REJECTED", staffNote?: string) =>
        apiFetch(`/order/admin/return/${id}/resolve`, {
            method: "PATCH",
            body: JSON.stringify({ status, staffNote })
        }),

    getAdminOrders: (page = 1, limit = 10, keyword = "", status = "") => {
        const query = `page=${page}&limit=${limit}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ""}${status ? `&status=${status}` : ""}`;
        return apiFetch(`/order/admin/all?${query}`);
    },
}