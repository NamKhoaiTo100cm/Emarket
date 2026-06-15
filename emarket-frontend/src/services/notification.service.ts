import { apiFetch } from "@/lib/api";

export const notificationService = {
    getNotifications: (page = 1, limit = 20) =>
        apiFetch(`/notification?page=${page}&limit=${limit}`),
        
    getUnreadCount: () =>
        apiFetch("/notification/unread-count"),
        
    markRead: (id: number) =>
        apiFetch(`/notification/${id}/read`, {
            method: "PATCH",
        }),
        
    markAllRead: () =>
        apiFetch("/notification/read-all", {
            method: "PATCH",
        }),
};
