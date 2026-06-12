import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    // ==================== SHOP CHAT ====================

    // async getOrCreateShopConversation(userId: number, shopId: number) {
    //     // Ngăn chủ shop tự chat với chính shop của họ
    //     const shop = await this.prisma.shop.findUnique({
    //         where: { id: shopId },
    //         select: { userId: true },
    //     });
    //     if (!shop) throw new NotFoundException('Shop not found');
    //     if (shop.userId === userId) {
    //         throw new BadRequestException('Bạn không thể tự chat với shop của chính mình');
    //     }

    //     return this.prisma.chatConversation.upsert({
    //         where: { userId_shopId: { userId, shopId } },
    //         create: { userId, shopId, type: 'shop' },
    //         update: {},
    //         include: {
    //             messages: { orderBy: { createdAt: 'asc' }, take: 50 },
    //             shop: { select: { id: true, name: true, logo: true } },
    //         },
    //     });
    // }


    async getOrCreateShopConversation(userId: number, shopId: number) {
        // Ngăn chủ shop tự chat với chính shop của họ
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            select: { userId: true },
        });
        if (!shop) throw new NotFoundException('Shop not found');
        // if (shop.userId === userId) {
        //     throw new BadRequestException('Bạn không thể tự chat với shop của chính mình');
        // }

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
    async getSupportConversationsNotAssigned() {
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

    async assignStaff(conversationId: number, staffId: number) {
        return this.prisma.chatConversation.update({
            where: { id: conversationId },
            data: { assignedStaffId: staffId },
        });
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
