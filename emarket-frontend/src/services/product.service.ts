// services/auth.service.ts
import { apiFetch } from '@/lib/api'
export const productService = {
    getAll: (page: number, limit: number, keyword: string = "", minRating: number = 0, categorySlug: string = "", minPrice?: number, maxPrice?: number, status?: string) => {
        let url = `/product?page=${page}&limit=${limit}&keyword=${keyword}&minRating=${minRating}&categorySlug=${categorySlug}`;
        if (minPrice !== undefined) url += `&minPrice=${minPrice}`;
        if (maxPrice !== undefined) url += `&maxPrice=${maxPrice}`;
        if (status !== undefined) url += `&status=${status}`;
        return apiFetch(url, {}, true);
    },
    getByIds: (ids: number[]) =>
        apiFetch(`/product/by-ids?ids=${ids.join(",")}`, {}, true),
    getOne: (id: number) =>
        apiFetch(`/product/${id}`, {}, true),
    createProduct: (product: any) =>
        apiFetch('/product', {
            method: 'POST',
            body: product,
        }),
    delete: (id: number) =>
        apiFetch(`/product/${id}`, {
            method: 'DELETE',
        }),
    findByShopId: (shopId: number, page: number = 1, limit: number = 10) =>
        apiFetch(`/product/shop/${shopId}?page=${page}&limit=${limit}`, {}, true),
    updateProduct: (id: number, product: any) =>
        apiFetch(`/product/${id}`, {
            method: 'PATCH',
            body: product,
        }),
    toggleBanProduct: (id: number) =>
        apiFetch(`/product/${id}/ban`, {
            method: 'PATCH',
        }),
    toggleSellingProduct: (id: number) =>
        apiFetch(`/product/${id}/toggle-selling`, {
            method: 'PATCH',
        }),
    updateStatus: (id: number, status: string) =>
        apiFetch(`/product/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
            headers: { 'Content-Type': 'application/json' },
        }),
    // Variants
    getVariants: (productId: number) =>
        apiFetch(`/product/${productId}/variants`, {}, true),
    createVariant: (productId: number, variant: { name: string; price: number; salePrice?: number; stock: number; sortOrder?: number }) =>
        apiFetch(`/product/${productId}/variants`, {
            method: 'POST',
            body: JSON.stringify(variant),
            headers: { 'Content-Type': 'application/json' },
        }),
    updateVariant: (variantId: number, variant: Partial<{ name: string; price: number; salePrice?: number; stock: number; sortOrder?: number }>) =>
        apiFetch(`/product-variant/${variantId}`, {
            method: 'PATCH',
            body: JSON.stringify(variant),
            headers: { 'Content-Type': 'application/json' },
        }),
    deleteVariant: (variantId: number) =>
        apiFetch(`/product-variant/${variantId}`, {
            method: 'DELETE',
        }),
}