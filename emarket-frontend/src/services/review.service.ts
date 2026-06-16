import { apiFetch } from "@/lib/api";

export const reviewService = {
    create: (review: FormData | any) => apiFetch('/review', {
        method: 'POST',
        body: review instanceof FormData ? review : JSON.stringify(review),
    }),
    getByProductId: (productId: number, page: number = 1, limit: number = 10) =>
        apiFetch(`/review/product/${productId}?page=${page}&limit=${limit}`, {}, true),
    getAll: () =>
        apiFetch('/review', {}, true),
    updateIsHiddenStatus: (id: number, isHidden: boolean) =>
        apiFetch(`/review/hidden/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ isHidden }),
        }, true),
    getSellerReviews: () =>
        apiFetch('/review/seller/reviews'),
    sellerReplyReview: (reviewId: number, sellerReply: string) =>
        apiFetch(`/review/seller/reply/${reviewId}`, {
            method: 'PATCH',
            body: JSON.stringify({ sellerReply })
        }),
}