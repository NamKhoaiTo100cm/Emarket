import { apiFetch } from "@/lib/api";

export const paymentService = {
    createProcessPayment: (orderId: number) => {
        return apiFetch(`/payment/process/${orderId}`, {
            method: 'POST',
        });
    },
    createMomoPayment: async (orderIds: number[]) => {
        const res = await apiFetch('/payment/momo/create', {
            method: 'POST',
            body: JSON.stringify({ orderIds }),
        });
        // if (!res.ok) throw new Error('Failed');
        return res;
    },
    verifyMomoPayment: async (params: any) => {
        return await apiFetch('/payment/momo/verify', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }
}


