import { apiFetch } from "@/lib/api"

export const voucherService = {
    getAllVouchers: (scope?: string, shopId?: string, search?: string, page?: string, limit?: string) => {
        return apiFetch(`/voucher`);
    },

    createPlatformVoucher: (data: any) => apiFetch('/voucher/platform', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    createShopVoucher: (data: any) => apiFetch('/voucher/shop', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    validateShopVoucher: (data: any) => apiFetch(`/voucher/validate/shop?code=${data.code}&orderTotal=${data.orderTotal}&shopId=${data.shopId}`),

    updateVoucher: (id: number, data: any) => apiFetch(`/voucher/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),

    deleteVoucher: (id: number) => apiFetch(`/voucher/${id}`, {
        method: 'DELETE',
    }),
}