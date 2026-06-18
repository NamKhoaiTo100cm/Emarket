import { apiFetch } from "@/lib/api";

export const chatService = {
    // ==================== SHOP CHAT ====================

    getOrCreateShopConversation: (shopId: number) =>
        apiFetch('/chat/conversation', {
            method: 'POST',
            body: JSON.stringify({ shopId }),
        }),

    getUserConversations: () =>
        apiFetch('/chat/conversations/user'),

    getSellerConversations: () =>
        apiFetch('/chat/conversations/seller'),

    // ==================== SUPPORT CHAT ====================

    getOrCreateSupportConversation: (type: 'user' | 'shop') =>
        apiFetch('/chat/support/conversation', {
            method: 'POST',
            body: JSON.stringify({ type }),
        }),

    /** Staff: lấy tất cả conversations chưa được assign */
    getSupportConversationsAll: () =>
        apiFetch('/chat/support/conversations/all'),

    /** Staff: lấy conversations đã assign cho mình */
    getMyAssignedConversations: () =>
        apiFetch('/chat/support/conversations/mine'),

    getUserSupportConversations: () =>
        apiFetch('/chat/support/conversations/users'),

    getShopSupportConversations: () =>
        apiFetch('/chat/support/conversations/shops'),

    /** Staff nhận conversation (assign về mình) */
    assignStaff: (conversationId: number) =>
        apiFetch('/chat/support/conversation/assign', {
            method: 'PATCH',
            body: JSON.stringify({ conversationId }),
        }),

    /** Staff kết thúc hỗ trợ (unassign) */
    unassignStaff: (conversationId: number) =>
        apiFetch('/chat/support/conversation/unassign', {
            method: 'PATCH',
            body: JSON.stringify({ conversationId }),
        }),

    // ==================== SHARED ====================

    getMessages: (conversationId: number) =>
        apiFetch(`/chat/conversation/${conversationId}/messages`),

    sendMessage: (conversationId: number, content: string, senderRole: 'user' | 'seller') =>
        apiFetch(`/chat/conversation/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content, senderRole }),
        }),

    sendSupportMessage: (conversationId: number, content: string) =>
        apiFetch(`/chat/conversation/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }),

    markAsRead: (conversationId: number, role: 'user' | 'seller' | 'staff') =>
        apiFetch(`/chat/conversation/${conversationId}/read`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        }),
}