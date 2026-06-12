import { apiFetch } from "@/lib/api";

export const withdrawalService = {
    getBalance: () => apiFetch("/withdrawal/balance"),

    getMyRequests: () => apiFetch("/withdrawal/my-requests"),

    createRequest: (data: {
        amount: number;
        bankName: string;
        bankAccount: string;
        accountHolder: string;
    }) => apiFetch("/withdrawal/request", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    // Admin
    getAdminList: (status?: string) =>
        apiFetch(`/withdrawal/admin/list${status ? `?status=${status}` : ""}`),

    resolveRequest: (id: number, status: "APPROVED" | "REJECTED", note?: string) =>
        apiFetch(`/withdrawal/admin/${id}/resolve`, {
            method: "PATCH",
            body: JSON.stringify({ status, note }),
        }),
};