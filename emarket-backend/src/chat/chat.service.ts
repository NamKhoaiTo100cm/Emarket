import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    // ==================== SHOP CHAT ====================

    async getOrCreateShopConversation(userId: number, shopId: number) {
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            select: { userId: true },
        });
        if (!shop) throw new NotFoundException('Shop not found');

        return this.prisma.chatConversation.upsert({
            where: { userId_shopId: { userId, shopId } },
            create: { userId, shopId, type: 'shop' },
            update: {},
            include: {
                messages: { orderBy: { createdAt: 'asc' }, take: 50 },
                shop: { select: { id: true, name: true, logo: true } },
            },
        });
    }

    async getUserConversations(userId: number) {
        return this.prisma.chatConversation.findMany({
            where: { userId, type: 'shop' },
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                shop: { select: { id: true, name: true, logo: true, description: true } },
            },
            orderBy: { lastMessageAt: 'desc' },
        });
    }

    async getSellerConversations(userId: number) {
        const shop = await this.prisma.shop.findFirst({ where: { userId }, select: { id: true } });
        if (!shop) throw new NotFoundException('Shop not found for this user');

        return this.prisma.chatConversation.findMany({
            where: { shopId: shop.id, type: 'shop' },
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                user: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { lastMessageAt: 'desc' },
        });
    }

    // ==================== SUPPORT CHAT ====================

    async getOrCreateSupportConversation(userId: number, isShop: boolean = false) {
        let shopId: number | null = null;
        if (isShop) {
            const shop = await this.prisma.shop.findUnique({
                where: { userId },
                select: { id: true },
            });
            if (!shop) throw new NotFoundException('Shop not found');
            shopId = shop.id;
        }

        // Tìm support conversation đã tồn tại
        let conversation = await this.prisma.chatConversation.findFirst({
            where: {
                userId,
                type: 'staff',
                shopId: shopId ?? null,
            },
        });

        if (!conversation) {
            try {
                conversation = await this.prisma.chatConversation.create({
                    data: {
                        userId,
                        type: 'staff',
                        ...(shopId ? { shopId } : {}),
                    },
                });
            } catch {
                // race condition
                conversation = await this.prisma.chatConversation.findFirst({
                    where: { userId, type: 'staff', shopId: shopId ?? null },
                });
            }
        }

        return this.prisma.chatConversation.findUnique({
            where: { id: conversation!.id },
            include: {
                messages: { orderBy: { createdAt: 'asc' }, take: 50 },
                shop: { select: { id: true, name: true, logo: true } },
                user: { select: { id: true, name: true, avatar: true } },
            },
        });
    }

    /** Tất cả conversations support chưa được assign (bất kỳ staff nào) */
    async getSupportConversationsUnassigned() {
        return this.prisma.chatConversation.findMany({
            where: { type: 'staff', assignedStaffId: null },
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                shop: { select: { id: true, name: true, logo: true, description: true } },
                user: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { lastMessageAt: 'desc' },
        });
    }

    /** Conversations đã được assign cho một staff cụ thể */
    async getMyAssignedConversations(staffId: number) {
        return this.prisma.chatConversation.findMany({
            where: { type: 'staff', assignedStaffId: staffId },
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                shop: { select: { id: true, name: true, logo: true, description: true } },
                user: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { lastMessageAt: 'desc' },
        });
    }

    async getUserSupportConversationsNotAssigned() {
        return this.prisma.chatConversation.findMany({
            where: { type: 'staff', shopId: null, assignedStaffId: null },
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                user: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { lastMessageAt: 'desc' },
        });
    }

    async getShopSupportConversationsNotAssigned() {
        return this.prisma.chatConversation.findMany({
            where: { type: 'staff', shopId: { not: null }, assignedStaffId: null },
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                shop: { select: { id: true, name: true, logo: true, description: true } },
            },
            orderBy: { lastMessageAt: 'desc' },
        });
    }

    /** Assign conversation cho staff — set assignedStaffId + assignedAt */
    async assignStaff(conversationId: number, staffId: number) {
        const conv = await this.prisma.chatConversation.findUnique({
            where: { id: conversationId },
            select: { assignedStaffId: true },
        });
        if (!conv) throw new NotFoundException('Conversation not found');
        if (conv.assignedStaffId && conv.assignedStaffId !== staffId) {
            throw new BadRequestException('Conversation đã được nhận bởi staff khác');
        }

        return this.prisma.chatConversation.update({
            where: { id: conversationId },
            data: {
                assignedStaffId: staffId,
                assignedAt: new Date(),
            },
            include: {
                shop: { select: { id: true, name: true, logo: true } },
                user: { select: { id: true, name: true, avatar: true } },
            },
        });
    }

    /** Unassign — staff kết thúc hỗ trợ, conversation quay về hàng chờ */
    async unassignStaff(conversationId: number, staffId: number) {
        const conv = await this.prisma.chatConversation.findUnique({
            where: { id: conversationId },
            select: { assignedStaffId: true },
        });
        if (!conv) throw new NotFoundException('Conversation not found');
        if (conv.assignedStaffId !== staffId) {
            throw new BadRequestException('Bạn không phải người nhận conversation này');
        }

        return this.prisma.chatConversation.update({
            where: { id: conversationId },
            data: {
                assignedStaffId: null,
                assignedAt: null,
                lastStaffActivity: new Date(),
            },
        });
    }

    /**
     * Auto-unassign tất cả conversations của một staff khi họ disconnect quá lâu.
     * Trả về danh sách các conversation đã được unassign để gateway emit events.
     */
    async unassignAllForStaff(staffId: number) {
        const conversations = await this.prisma.chatConversation.findMany({
            where: { assignedStaffId: staffId },
            include: {
                shop: { select: { id: true, name: true, logo: true } },
                user: { select: { id: true, name: true, avatar: true } },
            },
        });

        if (conversations.length === 0) return [];

        await this.prisma.chatConversation.updateMany({
            where: { assignedStaffId: staffId },
            data: {
                assignedStaffId: null,
                assignedAt: null,
                lastStaffActivity: new Date(),
            },
        });

        return conversations;
    }

    // ==================== SHARED ====================

    async getMessages(conversationId: number) {
        return this.prisma.chatMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async saveMessage(data: {
        conversationId: number;
        senderId: number;
        senderRole: 'user' | 'seller' | 'staff' | 'admin';
        content: string;
        attachmentUrl?: string;
    }) {
        const message = await this.prisma.chatMessage.create({ data });

        await this.prisma.chatConversation.update({
            where: { id: data.conversationId },
            data: {
                lastMessage: data.content,
                lastMessageAt: new Date(),
                // Cập nhật lastStaffActivity khi staff gửi tin
                ...(data.senderRole === 'staff' ? { lastStaffActivity: new Date() } : {}),
                ...(data.senderRole === 'seller' || data.senderRole === 'staff'
                    ? { unreadUser: { increment: 1 } }
                    : { unreadSeller: { increment: 1 } }),
            },
        });

        return message;
    }

    async markAsRead(conversationId: number, role: 'user' | 'seller' | 'staff') {
        await this.prisma.chatConversation.update({
            where: { id: conversationId },
            data: role === 'user' ? { unreadUser: 0 } : { unreadSeller: 0 },
        });
        await this.prisma.chatMessage.updateMany({
            where: { conversationId, isRead: false },
            data: { isRead: true },
        });
        return { success: true };
    }
}
