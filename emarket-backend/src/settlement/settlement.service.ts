import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SystemConfigService } from '../system-config/system-config.service';

@Injectable()
export class SettlementService {
    private readonly logger = new Logger(SettlementService.name);

    constructor(
        private prisma: PrismaService,
        private configService: SystemConfigService,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async settlePendingOrders() {
        const now = new Date();

        const orders = await this.prisma.order.findMany({
            where: {
                settlementAt: { lte: now },
                paymentStatus: 'paid',
                status: 'delivered',
                isSettled: false,
            },
        });

        if (orders.length === 0) return;

        const commissionRate = await this.configService.getCommissionRate();

        for (const order of orders) {
            const totalAmount = Number(order.total);
            const commission = Math.round(totalAmount * commissionRate);
            const netAmount = totalAmount - commission;

            await this.prisma.$transaction([
                this.prisma.shopBalance.upsert({
                    where: { shopId: order.shopId },
                    update: {
                        balance: { increment: netAmount },
                        pendingBalance: { decrement: totalAmount },
                    },
                    create: {
                        shopId: order.shopId,
                        balance: netAmount,
                        pendingBalance: 0,
                    },
                }),
                this.prisma.order.update({
                    where: { id: order.id },
                    data: { isSettled: true, commission: commission },
                }),
            ]);
        }

        this.logger.log(`Settled ${orders.length} orders with commission rate ${(commissionRate * 100).toFixed(1)}%`);
    }

    /**
     * Tự động hủy đơn hàng thanh toán MoMo quá hạn (10 phút không thanh toán)
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async cancelExpiredMomoOrders() {
        const cutoff = new Date(Date.now() - 10 * 60 * 1000);

        const expiredOrders = await this.prisma.order.findMany({
            where: {
                paymentMethod: 'momo',
                paymentStatus: 'processing',
                status: 'pending',
                createdAt: { lte: cutoff }
            },
            select: { id: true }
        });

        if (expiredOrders.length === 0) return;

        const expiredIds = expiredOrders.map(o => o.id);

        await this.prisma.order.updateMany({
            where: { id: { in: expiredIds } },
            data: {
                paymentStatus: 'failed',
                status: 'cancelled'
            }
        });

        this.logger.log(`[AutoCancel] Cancelled ${expiredOrders.length} expired unpaid Momo orders`);
    }

    /**
     * Tự động xác nhận nhận hàng khi User không bấm "Đã nhận hàng"
     * Thời gian chờ có thể cấu hình qua System Config key: auto_confirm_minutes
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async autoConfirmDelivery() {
        const minutes = await this.configService.getAutoConfirmMinutes();
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);

        const orders = await this.prisma.order.findMany({
            where: {
                status: 'shipping',
                updatedAt: { lte: cutoff },
            },
        });

        if (orders.length === 0) return;

        const settlementAt = new Date();
        settlementAt.setDate(settlementAt.getDate() + 3);

        for (const order of orders) {
            const paymentStatusUpdate = order.paymentMethod === 'cod' ? 'paid' : undefined;

            await this.prisma.$transaction([
                this.prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'delivered',
                        settlementAt,
                        ...(paymentStatusUpdate ? { paymentStatus: paymentStatusUpdate } : {}),
                    },
                }),
                this.prisma.shopBalance.upsert({
                    where: { shopId: order.shopId },
                    update: { pendingBalance: { increment: order.total } },
                    create: { shopId: order.shopId, pendingBalance: order.total, balance: 0 },
                }),
            ]);
        }

        this.logger.log(`[AutoConfirm] Tự động xác nhận ${orders.length} đơn hàng sau ${minutes} phút không có phản hồi từ người mua`);
    }

    /**
     * [Backup] Tự động unassign staff khỏi support conversation khi không hoạt động.
     * Chạy mỗi 10 phút — là lưới an toàn dự phòng cho WebSocket timer.
     *
     * Logic: nếu conversation đã được assign (assignedStaffId != null) nhưng:
     *   - lastStaffActivity > 15 phút trước, HOẶC
     *   - lastStaffActivity IS NULL nhưng assignedAt > 15 phút trước
     * → unassign về hàng chờ.
     */
    @Cron('*/10 * * * *')
    async autoUnassignInactiveStaff() {
        const cutoff = new Date(Date.now() - 15 * 60 * 1000); // 15 phút trước

        const staleConversations = await this.prisma.chatConversation.findMany({
            where: {
                type: 'staff',
                assignedStaffId: { not: null },
                OR: [
                    // Staff có hoạt động nhưng đã quá 15 phút không làm gì
                    { lastStaffActivity: { lte: cutoff } },
                    // Staff chưa gửi tin nào (lastStaffActivity null) nhưng assign quá 15 phút
                    {
                        lastStaffActivity: null,
                        assignedAt: { lte: cutoff },
                    },
                ],
            },
            select: { id: true, assignedStaffId: true },
        });

        if (staleConversations.length === 0) return;

        await this.prisma.chatConversation.updateMany({
            where: { id: { in: staleConversations.map((c) => c.id) } },
            data: {
                assignedStaffId: null,
                assignedAt: null,
                lastStaffActivity: new Date(),
            },
        });

        this.logger.log(
            `[AutoUnassign] Unassigned ${staleConversations.length} stale support conversation(s) ` +
            `(staffIds: ${[...new Set(staleConversations.map((c) => c.assignedStaffId))].join(', ')})`,
        );
    }
}
