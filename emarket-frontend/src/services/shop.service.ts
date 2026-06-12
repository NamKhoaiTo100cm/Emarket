// services/shop.service.ts
import { apiFetch } from '@/lib/api'
export const shopService = {
    getAll: () => apiFetch('/shop', {}),
    getOne: (id: number) => apiFetch(`/shop/${id}`, {}, true),
    create: (data: any) => apiFetch('/shop', {
        method: 'POST',
        credentials: "include",
        body: data,
    }),
    update: (id: number, data: any) => apiFetch(`/shop/${id}`, { method: 'PUT', body: data }),
    updateProfile: (data: FormData) => apiFetch('/shop/profile', {
        method: 'PUT',
        body: data,
    }),
    updateStatus: (id: number, status: 'active' | 'banned') => apiFetch(`/shop/update-status/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    delete: (id: number) => apiFetch(`/shop/${id}`, { method: 'DELETE' }),
    getMyShop: (userId: number) => apiFetch(`/shop/my-shop/${userId}`, {}),

    // ===== Verification =====
    submitVerification: (formData: FormData) => apiFetch('/shop/verification', {
        method: 'POST',
        body: formData,
    }),
    getVerifications: (status?: string) => apiFetch(`/shop/verifications${status ? `?status=${status}` : ''}`, {}),
    getMyVerification: () => apiFetch('/shop/my-verification', {}),
    reviewVerification: (id: number, data: { status: 'approved' | 'rejected'; staffNote?: string }) =>
        apiFetch(`/shop/verification/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),
    getStatistics: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiFetch(`/shop/my-shop/statistics${query}`, {});
    },
    getAdminStatistics: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiFetch(`/shop/admin/statistics${query}`, {});
    },
}