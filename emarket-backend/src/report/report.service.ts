import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportType, ReportStatus } from 'src/generated/prisma/client';

@Injectable()
export class ReportService {
    constructor(private prisma: PrismaService) {}

    async createReport(userId: number, type: string, targetId: number, reason: string) {
        if (!reason || reason.trim() === '') {
            throw new BadRequestException('Lý do báo cáo không được để trống');
        }

        const typeEnum = type.toUpperCase() as ReportType;
        const data: any = {
            userId,
            type: typeEnum,
            reason,
            status: ReportStatus.PENDING,
        };

        if (typeEnum === ReportType.PRODUCT) {
            const product = await this.prisma.product.findUnique({ where: { id: targetId } });
            if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
            data.productId = targetId;
        } else if (typeEnum === ReportType.REVIEW) {
            const review = await this.prisma.review.findUnique({ where: { id: targetId } });
            if (!review) throw new NotFoundException('Đánh giá không tồn tại');
            data.reviewId = targetId;
        } else if (typeEnum === ReportType.SHOP) {
            const shop = await this.prisma.shop.findUnique({ where: { id: targetId } });
            if (!shop) throw new NotFoundException('Cửa hàng không tồn tại');
            data.shopId = targetId;
        } else {
            throw new BadRequestException('Loại báo cáo không hợp lệ');
        }

        const report = await this.prisma.report.create({ data });
        return {
            ...report,
            type: report.type.toLowerCase(),
            status: report.status.toLowerCase(),
        };
    }

    async getReportStats() {
        // 1. Products
        const productGroups = await this.prisma.report.groupBy({
            by: ['productId'],
            where: { type: ReportType.PRODUCT, status: ReportStatus.PENDING, productId: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        const reportedProducts = await Promise.all(
            productGroups.map(async (group) => {
                const product = await this.prisma.product.findUnique({
                    where: { id: group.productId as number },
                    include: { shop: { select: { name: true } } },
                });
                return {
                    productId: group.productId,
                    reportCount: group._count.id,
                    productName: product?.name || 'Đã bị xóa',
                    shopName: product?.shop?.name || 'N/A',
                    status: product?.status || 'N/A',
                };
            })
        );

        // 2. Reviews
        const reviewGroups = await this.prisma.report.groupBy({
            by: ['reviewId'],
            where: { type: ReportType.REVIEW, status: ReportStatus.PENDING, reviewId: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        const reportedReviews = await Promise.all(
            reviewGroups.map(async (group) => {
                const review = await this.prisma.review.findUnique({
                    where: { id: group.reviewId as number },
                    include: {
                        user: { select: { name: true } },
                        product: { select: { name: true } },
                    },
                });
                return {
                    reviewId: group.reviewId,
                    reportCount: group._count.id,
                    comment: review?.comment || 'N/A',
                    rating: review?.rating || 0,
                    reviewerName: review?.user?.name || 'N/A',
                    productName: review?.product?.name || 'N/A',
                    isHidden: review?.isHidden ?? false,
                };
            })
        );

        // 3. Shops
        const shopGroups = await this.prisma.report.groupBy({
            by: ['shopId'],
            where: { type: ReportType.SHOP, status: ReportStatus.PENDING, shopId: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        const reportedShops = await Promise.all(
            shopGroups.map(async (group) => {
                const shop = await this.prisma.shop.findUnique({
                    where: { id: group.shopId as number },
                });
                return {
                    shopId: group.shopId,
                    reportCount: group._count.id,
                    shopName: shop?.name || 'N/A',
                    address: shop?.address || 'N/A',
                    status: shop?.status || 'N/A',
                };
            })
        );

        return {
            reportedProducts,
            reportedReviews,
            reportedShops,
        };
    }

    async getReportDetails(type: string, targetId: number) {
        const typeEnum = type.toUpperCase() as ReportType;
        const whereClause: any = { type: typeEnum, status: ReportStatus.PENDING };
        if (typeEnum === ReportType.PRODUCT) whereClause.productId = targetId;
        else if (typeEnum === ReportType.REVIEW) whereClause.reviewId = targetId;
        else if (typeEnum === ReportType.SHOP) whereClause.shopId = targetId;
        else throw new BadRequestException('Loại báo cáo không hợp lệ');

        const reports = await this.prisma.report.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return reports.map(r => ({
            ...r,
            type: r.type.toLowerCase(),
            status: r.status.toLowerCase(),
        }));
    }

    async resolveReport(type: string, targetId: number, action: 'ban' | 'hide' | 'dismiss', staffId: number) {
        const typeEnum = type.toUpperCase() as ReportType;
        const whereReport: any = { type: typeEnum, status: ReportStatus.PENDING };
        if (typeEnum === ReportType.PRODUCT) whereReport.productId = targetId;
        else if (typeEnum === ReportType.REVIEW) whereReport.reviewId = targetId;
        else if (typeEnum === ReportType.SHOP) whereReport.shopId = targetId;
        else throw new BadRequestException('Loại báo cáo không hợp lệ');

        const reports = await this.prisma.report.findMany({ where: whereReport });
        if (reports.length === 0) {
            throw new BadRequestException('Không tìm thấy báo cáo chưa xử lý cho đối tượng này');
        }

        const nextStatus = action === 'dismiss' ? ReportStatus.DISMISSED : ReportStatus.RESOLVED;

        const dbOps: any[] = [
            this.prisma.report.updateMany({
                where: whereReport,
                data: {
                    status: nextStatus,
                    resolvedAt: new Date(),
                    resolvedBy: staffId,
                },
            }),
        ];

        if (action === 'ban' && typeEnum === ReportType.PRODUCT) {
            dbOps.push(
                this.prisma.product.update({
                    where: { id: targetId },
                    data: { status: 'banned' },
                })
            );
        } else if (action === 'ban' && typeEnum === ReportType.SHOP) {
            dbOps.push(
                this.prisma.shop.update({
                    where: { id: targetId },
                    data: { status: 'banned' },
                })
            );
        } else if (action === 'hide' && typeEnum === ReportType.REVIEW) {
            dbOps.push(
                this.prisma.review.update({
                    where: { id: targetId },
                    data: { isHidden: true },
                })
            );
        }

        await this.prisma.$transaction(dbOps);
        return { message: 'Xử lý báo cáo thành công' };
    }

    async getReportHistory() {
        const reports = await this.prisma.report.findMany({
            where: { status: { in: [ReportStatus.RESOLVED, ReportStatus.DISMISSED] } },
            include: {
                user: { select: { name: true, email: true } },
                product: { select: { name: true } },
                review: { select: { comment: true } },
                shop: { select: { name: true } },
            },
            orderBy: { resolvedAt: 'desc' },
        });

        const staffIds = Array.from(new Set(reports.map(r => r.resolvedBy).filter(Boolean)));
        const staffs = await this.prisma.user.findMany({
            where: { id: { in: staffIds as number[] } },
            select: { id: true, name: true, email: true },
        });
        const staffMap = new Map(staffs.map(s => [s.id, s]));

        return reports.map(r => ({
            ...r,
            type: r.type.toLowerCase(),
            status: r.status.toLowerCase(),
            resolver: r.resolvedBy ? staffMap.get(r.resolvedBy) : null,
        }));
    }
}
