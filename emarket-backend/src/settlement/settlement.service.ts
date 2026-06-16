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
}
