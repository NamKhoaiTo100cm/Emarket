import { apiFetch } from "@/lib/api";

// export const chatService = {
//     // getAllUserConversations: () => apiFetch(`/chat/conversations/user`),
//     // getAllSellerConversations: () => apiFetch(`/chat/conversations/seller`),
//     // getMessages: (conversationId: number) => apiFetch(`/chat/conversation/${conversationId}/messages`),
//     // getOrCreate: (shopId: number) => apiFetch(`/chat/conversation`, { method: "POST", body: JSON.stringify({ shopId }) }),
//     // markAsRead: (conversationId: number, role: 'user' | 'seller') => apiFetch(`/chat/conversation/${conversationId}/read`, { method: "PATCH", body: JSON.stringify({ role }) }),
//     // sendMessage: (conversationId: number, content: string, senderRole: 'user' | 'seller') =>
//     //     apiFetch(`/chat/conversation/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ content, senderRole }) }),

//     // getOrCreateSupportConversations: (role: 'user' | 'shop') => apiFetch(`/chat-support/conversation`, { method: "POST", body: JSON.stringify({ type: role }) }),
//     // getAllSupportChatNotAssigned: () => apiFetch(`/chat-support/conversations/staff-not-assigned`),
//     // getAllUserChatNotAssignedToStaff: () => apiFetch(`/chat-support/conversations/users`),
//     // getAllShopChatNotAssignedToStaff: () => apiFetch(`/chat-support/conversations/shops`),
//     // assignStaffToConversation: (conversationId: number) => apiFetch(`/chat-support/conversation/assigned-staff`, { method: "PATCH", body: JSON.stringify({ conversationId }) }),
//     // getSupportConversationMessages: (conversationId: number) => apiFetch(`/chat-support/conversation/${conversationId}/messages`),
//     // replyToSupportConversation: (conversationId: number, content: string) => apiFetch(`/chat-support/conversation/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ content }) }),

//     sendMessage: (conversationId: number, content: string, senderRole: 'user' | 'seller') =>
//         apiFetch(`/chat/conversation/${conversationId}/messages`, {
//             method: "POST",
//             body: JSON.stringify({ content, senderRole })
//         }),

//     sendSupportMessage: (conversationId: number, content: string) =>
//         apiFetch(`/chat/conversation/${conversationId}/messages`, {
//             method: "POST",
//             body: JSON.stringify({ content })
//         }),

//     getOrCreateSupportConversation: (type: 'user' | 'shop') =>
//         apiFetch('/chat-support/conversation', {
//             method: 'POST',
//             body: JSON.stringify({ type }),
//         }),

//     getSupportConversationsNotAssigned: () =>
//         apiFetch('/chat-support/conversations/staff-not-assigned'),
//     getUserSupportConversationsNotAssigned: () =>
//         apiFetch('/chat-support/conversations/users'),
//     getShopSupportConversationsNotAssigned: () =>
//         apiFetch('/chat-support/conversations/shops'),
//     getConversationMessages: (conversationId: number) =>
//         apiFetch(`/chat/conversation/${conversationId}/messages`),
//     markAsRead: (conversationId: number, role: 'user' | 'seller' | 'staff') =>
//         apiFetch(`/chat/conversation/${conversationId}/read`, {
//             method: 'PATCH',
//             body: JSON.stringify({ role }),
//         }),

// }

// import { apiFetch } from "@/lib/api";


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

    getSupportConversationsAll: () =>
        apiFetch('/chat/support/conversations/all'),

    getUserSupportConversations: () =>
        apiFetch('/chat/support/conversations/users'),

    getShopSupportConversations: () =>
        apiFetch('/chat/support/conversations/shops'),

    assignStaff: (conversationId: number) =>
        apiFetch('/chat/support/conversation/assign', {
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