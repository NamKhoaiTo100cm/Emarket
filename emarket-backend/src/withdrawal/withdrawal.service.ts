import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalDto, ResolveWithdrawalDto } from './dto/withdrawal.dto';
import { WithdrawalStatus } from '../generated/prisma/enums';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class WithdrawalService {
    constructor(
        private prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    private async getShopByUserId(userId: number) {
        const shop = await this.prisma.shop.findUnique({
            where: { userId },
        });
        if (!shop) throw new NotFoundException('Shop not found');
        return shop;
    }

    async getBalance(userId: number) {
        const shop = await this.getShopByUserId(userId);

        const balance = await this.prisma.shopBalance.findUnique({
            where: { shopId: shop.id },
        });

        return {
            balance: balance?.balance ?? 0,
            pendingBalance: balance?.pendingBalance ?? 0,
        };
    }

    async createRequest(userId: number, dto: CreateWithdrawalDto) {
        const shop = await this.getShopByUserId(userId);

        const shopBalance = await this.prisma.shopBalance.findUnique({
            where: { shopId: shop.id },
        });

        if (!shopBalance || Number(shopBalance.balance) < dto.amount)
            throw new BadRequestException('Số dư không đủ');

        // Dùng transaction để đảm bảo atomicity
        const [request] = await this.prisma.$transaction([
            this.prisma.withdrawalRequest.create({
                data: {
                    shopId: shop.id,
                    amount: dto.amount,
                    bankName: dto.bankName,
                    bankAccount: dto.bankAccount,
                    accountHolder: dto.accountHolder,
                    status: 'APPROVED',
                    resolvedAt: new Date(),
                    note: 'Thanh toán tự động qua MoMo (Sandbox)',
                },
            }),
            this.prisma.shopBalance.update({
                where: { shopId: shop.id },
                data: { balance: { decrement: dto.amount } },
            }),
        ]);

        return request;
    }

    async getMyRequests(userId: number) {
        const shop = await this.getShopByUserId(userId);

        return this.prisma.withdrawalRequest.findMany({
            where: { shopId: shop.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Admin
    async findAll(status?: WithdrawalStatus) {
        const requests = await this.prisma.withdrawalRequest.findMany({
            where: status ? { status } : undefined,
            include: {
                shop: { select: { id: true, name: true, logo: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return requests.map(req => {
            if (req.shop && req.shop.logo) {
                const logoUrl = req.shop.logo.startsWith('http')
                    ? req.shop.logo
                    : this.cloudinaryService.getUrl(req.shop.logo, { width: 100, height: 100, crop: 'fill' });
                return {
                    ...req,
                    shop: {
                        ...req.shop,
                        logo: logoUrl,
                    },
                };
            }
            return req;
        });
    }

    async resolve(id: number, dto: ResolveWithdrawalDto) {
        const request = await this.prisma.withdrawalRequest.findUnique({
            where: { id },
        });

        if (!request) throw new NotFoundException('Request not found');
        if (request.status !== 'PENDING')
            throw new BadRequestException('Request already resolved');

        const ops: any[] = [
            this.prisma.withdrawalRequest.update({
                where: { id },
                data: {
                    status: dto.status,
                    note: dto.note,
                    resolvedAt: new Date(),
                },
            }),
        ];

        // Reject → hoàn tiền lại
        if (dto.status === 'REJECTED') {
            ops.push(
                this.prisma.shopBalance.update({
                    where: { shopId: request.shopId },
                    data: { balance: { increment: request.amount } },
                })
            );
        }

        const [updated] = await this.prisma.$transaction(ops);
        return updated;
    }
}