import { apiFetch } from "@/lib/api";

export const reportService = {
    createReport: (data: { type: string; targetId: number; reason: string }) =>
        apiFetch("/report", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getStats: () => apiFetch("/report/stats"),

    getDetails: (type: string, targetId: number) =>
        apiFetch(`/report/details?type=${type}&targetId=${targetId}`),

    resolveReport: (data: { type: string; targetId: number; action: "ban" | "hide" | "dismiss" }) =>
        apiFetch("/report/resolve", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getHistory: () => apiFetch("/report/history"),
};

