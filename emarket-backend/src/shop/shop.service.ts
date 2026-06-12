// src/shop/shop.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShopStatus, VerificationStatus } from 'src/generated/prisma/enums';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';

@Injectable()
export class ShopService {
    constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) { }

    async create(userId: number, dto: CreateShopDto, files: { avatarImage?: Express.Multer.File[], bannerImage?: Express.Multer.File[] }) {
        const checkShop = await this.prisma.shop.findUnique({
            where: { userId },
        });

        if (checkShop) {
            throw new BadRequestException('You already have a shop');
        }

        const avatarPublicId = files?.avatarImage?.[0] ? await this.cloudinary.uploadFile(files.avatarImage[0], 'shops/avatars') : null;
        const bannerPublicId = files?.bannerImage?.[0] ? await this.cloudinary.uploadFile(files.bannerImage[0], 'shops/banners') : null;
        console.log("avatarPublicId: ", avatarPublicId);
        console.log("bannerPublicId: ", bannerPublicId);
        await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'seller' },
        })
        return this.prisma.shop.create({
            data: {
                ...dto,
                logo: avatarPublicId,
                banner: bannerPublicId,
                user: { connect: { id: userId } },
                status: ShopStatus.active,
            },
        });
    }

    async findAll() {
        const shops = await this.prisma.shop.findMany({
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const formattedShops = shops.map(shop => {
            const logoUrl = shop.logo ? this.cloudinary.getUrl(shop.logo, { width: 100, height: 100, crop: 'fill' }) : null;
            const bannerUrl = shop.banner ? this.cloudinary.getUrl(shop.banner) : null;

            // Loại bỏ _count khỏi shop hiện tại trước khi trả về
            const { _count, ...shopWithoutCount } = shop as any;

            return {
                ...shopWithoutCount,
                logo: logoUrl,
                banner: bannerUrl,
                productCount: shop._count.products,  // Thêm productCount riêng
                isVerified: shop.verificationStatus === VerificationStatus.approved,  // Computed field
            };
        });

        return formattedShops;
    }

    async findOne(id: number) {
        const shop = await this.prisma.shop.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
        if (!shop) {
            throw new NotFoundException('Shop not found');
        }

        const logoUrl = shop.logo ? this.cloudinary.getUrl(shop.logo, { width: 100, height: 100, crop: 'fill' }) : null;
        const bannerUrl = shop.banner ? this.cloudinary.getUrl(shop.banner) : null;
        const productCount: number = shop._count.products;

        // Loại bỏ trường _count khỏi kết quả trả về
        const { _count, ...shopWithoutCount } = shop as any;

        return { ...shopWithoutCount, logo: logoUrl, banner: bannerUrl, productCount, isVerified: shop.verificationStatus === VerificationStatus.approved };
    }

    async findOneByUserId(userId: number) {
        const shop = await this.prisma.shop.findUnique({ where: { userId }, include: { _count: { select: { products: true } } } });
        if (!shop) {
            throw new NotFoundException('Shop not found');
        }
        const logoUrl = shop.logo ? this.cloudinary.getUrl(shop.logo, { width: 100, height: 100, crop: 'fill' }) : null;
        const bannerUrl = shop.banner ? this.cloudinary.getUrl(shop.banner) : null;
        const productCount: number = shop._count.products;

        const { _count, ...shopWithoutCount } = shop as any;

        return { ...shopWithoutCount, logo: logoUrl, banner: bannerUrl, productCount, isVerified: shop.verificationStatus === VerificationStatus.approved };
    }

    async updateShopStatus(id: number, status: ShopStatus) {
        const shop = await this.prisma.shop.findUnique({ where: { id } });
        if (!shop) {
            throw new NotFoundException('Shop not found');
        }
        const updatedShop = await this.prisma.shop.update({
            where: { id },
            data: { status: status },
        });
        return updatedShop;
    }

    async update(id: number, dto: UpdateShopDto) {
        return this.prisma.shop.update({
            where: { id },
            data: dto,
        });
    }



    async remove(id: number) {
        return this.prisma.shop.delete({
            where: { id },
        });
    }

    // ==================== VERIFICATION ====================

    async submitVerification(shopId: number, dto: SubmitVerificationDto, files: Express.Multer.File[]) {
        // Kiểm tra shop tồn tại
        const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
        if (!shop) throw new NotFoundException('Shop not found');

        // Nếu shop đã verified rồi thì không cần nộp nữa
        if (shop.verificationStatus === VerificationStatus.approved) throw new BadRequestException('Shop is already verified');

        // Kiểm tra có đang pending không
        const existingPending = await this.prisma.shopVerification.findFirst({
            where: { shopId, status: VerificationStatus.pending },
        });
        if (existingPending) throw new BadRequestException('You already have a pending verification request');

        // Upload ảnh lên Cloudinary
        const uploadedPaths: string[] = [];
        for (const file of files) {
            const publicId = await this.cloudinary.uploadFile(file, 'shop-verifications');
            if (publicId) uploadedPaths.push(publicId);
        }

        // Tạo yêu cầu xác thực
        const verification = await this.prisma.shopVerification.create({
            data: {
                shopId,
                note: dto.note,
                documents: {
                    create: uploadedPaths.map(path => ({ imagePath: path })),
                },
            },
            include: { documents: true },
        });

        // Cập nhật verificationStatus của shop thành pending
        await this.prisma.shop.update({
            where: { id: shopId },
            data: { verificationStatus: VerificationStatus.pending },
        });

        return verification;
    }

    async getVerifications(status?: VerificationStatus) {
        const verifications = await this.prisma.shopVerification.findMany({
            where: status ? { status } : undefined,
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        phone: true,
                        address: true,
                        verificationStatus: true,
                    },
                },
                documents: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Format URLs
        return verifications.map(v => ({
            ...v,
            shop: {
                ...v.shop,
                logo: v.shop.logo ? this.cloudinary.getUrl(v.shop.logo, { width: 80, height: 80, crop: 'fill' }) : null,
                isVerified: v.shop.verificationStatus === VerificationStatus.approved,  // Computed
            },
            documents: v.documents.map(doc => ({
                ...doc,
                imagePath: this.cloudinary.getUrl(doc.imagePath),
            })),
        }));
    }

    async getMyVerification(shopId: number) {
        const verifications = await this.prisma.shopVerification.findMany({
            where: { shopId },
            include: { documents: true },
            orderBy: { createdAt: 'desc' },
        });

        // Format ảnh
        return verifications.map(v => ({
            ...v,
            documents: v.documents.map(doc => ({
                ...doc,
                imagePath: this.cloudinary.getUrl(doc.imagePath),
            })),
        }));
    }

    async reviewVerification(verificationId: number, staffId: number, dto: ReviewVerificationDto) {
        const verification = await this.prisma.shopVerification.findUnique({
            where: { id: verificationId },
            include: { shop: true },
        });
        if (!verification) throw new NotFoundException('Verification request not found');
        if (verification.status !== VerificationStatus.pending) {
            throw new BadRequestException('This request has already been reviewed');
        }

        const isApproved = dto.status === VerificationStatus.approved;

        // Cập nhật trạng thái yêu cầu
        await this.prisma.shopVerification.update({
            where: { id: verificationId },
            data: {
                status: dto.status,
                staffNote: dto.staffNote,
                reviewedBy: staffId,
                reviewedAt: new Date(),
            },
        });

        // Cập nhật verificationStatus của shop (isVerified computed từ trường này)
        await this.prisma.shop.update({
            where: { id: verification.shopId },
            data: {
                verificationStatus: dto.status,
            },
        });

        return { message: isApproved ? 'Shop đã được xác thực thành công' : 'Yêu cầu xác thực đã bị từ chối' };
    }

    async updateProfile(userId: number, dto: UpdateShopDto, files?: { avatarImage?: Express.Multer.File[], bannerImage?: Express.Multer.File[] }) {
        const shop = await this.prisma.shop.findUnique({ where: { userId } });
        if (!shop) throw new NotFoundException('Shop not found');

        const updateData: any = { ...dto };

        if (files?.avatarImage?.[0]) {
            const avatarPublicId = await this.cloudinary.uploadFile(files.avatarImage[0], 'shops/avatars');
            updateData.logo = avatarPublicId;
        }

        if (files?.bannerImage?.[0]) {
            const bannerPublicId = await this.cloudinary.uploadFile(files.bannerImage[0], 'shops/banners');
            updateData.banner = bannerPublicId;
        }

        await this.prisma.shop.update({
            where: { id: shop.id },
            data: updateData,
        });

        return this.findOneByUserId(userId);
    }

    async getStatistics(shopId: number, startDateStr?: string, endDateStr?: string) {
        let startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (startDateStr) {
            startDate = new Date(startDateStr);
            startDate.setHours(0, 0, 0, 0);
        }
        if (endDateStr) {
            endDate = new Date(endDateStr);
            endDate.setHours(23, 59, 59, 999);
        }

        const [totalProducts, totalOrders, revenueResult, statusGroup] = await Promise.all([
            this.prisma.product.count({ where: { shopId } }),
            this.prisma.order.count({ where: { shopId } }),
            this.prisma.order.aggregate({
                where: {
                    shopId,
                    status: 'delivered',
                },
                _sum: {
                    total: true,
                },
            }),
            this.prisma.order.groupBy({
                by: ['status'],
                where: { shopId },
                _count: {
                    id: true,
                },
            }),
        ]);

        const totalRevenue = Number(revenueResult._sum.total || 0);

        // Map order statuses
        const statusCounts = {
            pending: 0,
            confirmed: 0,
            shipping: 0,
            delivered: 0,
            cancelled: 0,
            returned: 0,
        };

        statusGroup.forEach((item) => {
            if (item.status in statusCounts) {
                statusCounts[item.status] = item._count.id;
            }
        });

        // Daily statistics
        const ordersInPeriod = await this.prisma.order.findMany({
            where: {
                shopId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                total: true,
                status: true,
                createdAt: true,
            },
        });

        const dailyMap = new Map<string, { revenue: number; orderCount: number }>();
        const current = new Date(startDate);
        while (current <= endDate) {
            const dateStr = current.toISOString().split('T')[0];
            dailyMap.set(dateStr, { revenue: 0, orderCount: 0 });
            current.setDate(current.getDate() + 1);
        }

        ordersInPeriod.forEach((order) => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            const currentVal = dailyMap.get(dateStr) || { revenue: 0, orderCount: 0 };
            const isDelivered = order.status === 'delivered';
            dailyMap.set(dateStr, {
                revenue: currentVal.revenue + (isDelivered ? Number(order.total) : 0),
                orderCount: currentVal.orderCount + 1,
            });
        });

        const chartData = Array.from(dailyMap.entries())
            .map(([date, data]) => ({
                date,
                revenue: data.revenue,
                orderCount: data.orderCount,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Top-selling products
        const orderItems = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    shopId,
                    status: 'delivered',
                },
            },
            select: {
                productId: true,
                productName: true,
                productImage: true,
                quantity: true,
                price: true,
                product: {
                    select: {
                        images: {
                            where: {
                                isMain: true,
                            },
                            select: {
                                imagePath: true,
                            },
                        },
                    },
                },
            },
        });

        const productMap = new Map<number, { name: string; image: string; quantity: number; revenue: number }>();
        orderItems.forEach((item) => {
            const fallbackImage = item.product?.images?.[0]?.imagePath || '';
            const existing = productMap.get(item.productId) || {
                name: item.productName || 'Sản phẩm không tên',
                image: item.productImage || fallbackImage || '',
                quantity: 0,
                revenue: 0,
            };
            existing.quantity += item.quantity;
            existing.revenue += item.quantity * Number(item.price);
            productMap.set(item.productId, existing);
        });

        const topProducts = Array.from(productMap.entries())
            .map(([id, data]) => {
                const imageUrl = data.image ? (data.image.startsWith('http') ? data.image : this.cloudinary.getUrl(data.image)) : '';
                return {
                    id,
                    name: data.name,
                    image: imageUrl,
                    quantity: data.quantity,
                    revenue: data.revenue,
                };
            })
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            summary: {
                totalRevenue,
                totalOrders,
                totalProducts,
                statusCounts,
            },
            chartData,
            topProducts,
        };
    }

    async getAdminStatistics(startDateStr?: string, endDateStr?: string) {
        let startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (startDateStr) {
            startDate = new Date(startDateStr);
            startDate.setHours(0, 0, 0, 0);
        }
        if (endDateStr) {
            endDate = new Date(endDateStr);
            endDate.setHours(23, 59, 59, 999);
        }

        const [totalProducts, totalOrders, totalShops, totalUsers, revenueResult, platformRevenueResult, statusGroup] = await Promise.all([
            this.prisma.product.count(),
            this.prisma.order.count(),
            this.prisma.shop.count(),
            this.prisma.user.count({ where: { role: 'user' } }),
            this.prisma.order.aggregate({
                where: {
                    status: 'delivered',
                },
                _sum: {
                    total: true,
                },
            }),
            this.prisma.order.aggregate({
                _sum: {
                    commission: true,
                },
            }),
            this.prisma.order.groupBy({
                by: ['status'],
                _count: {
                    id: true,
                },
            }),
        ]);

        const totalRevenue = Number(revenueResult._sum.total || 0);
        const platformRevenue = Number(platformRevenueResult._sum.commission || 0);

        // Map order statuses
        const statusCounts = {
            pending: 0,
            confirmed: 0,
            shipping: 0,
            delivered: 0,
            cancelled: 0,
            returned: 0,
        };

        statusGroup.forEach((item) => {
            if (item.status in statusCounts) {
                statusCounts[item.status] = item._count.id;
            }
        });

        // Daily statistics
        const ordersInPeriod = await this.prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                total: true,
                status: true,
                commission: true,
                createdAt: true,
            },
        });

        const dailyMap = new Map<string, { revenue: number; platformRevenue: number; orderCount: number }>();
        const current = new Date(startDate);
        while (current <= endDate) {
            const dateStr = current.toISOString().split('T')[0];
            dailyMap.set(dateStr, { revenue: 0, platformRevenue: 0, orderCount: 0 });
            current.setDate(current.getDate() + 1);
        }

        ordersInPeriod.forEach((order) => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            const currentVal = dailyMap.get(dateStr) || { revenue: 0, platformRevenue: 0, orderCount: 0 };
            const isDelivered = order.status === 'delivered';
            dailyMap.set(dateStr, {
                revenue: currentVal.revenue + (isDelivered ? Number(order.total) : 0),
                platformRevenue: currentVal.platformRevenue + Number(order.commission || 0),
                orderCount: currentVal.orderCount + 1,
            });
        });

        const chartData = Array.from(dailyMap.entries())
            .map(([date, data]) => ({
                date,
                revenue: data.revenue,
                platformRevenue: data.platformRevenue,
                orderCount: data.orderCount,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Top-selling products
        const orderItems = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    status: 'delivered',
                },
            },
            select: {
                productId: true,
                productName: true,
                productImage: true,
                quantity: true,
                price: true,
                product: {
                    select: {
                        images: {
                            where: { isMain: true },
                            select: { imagePath: true },
                        },
                        shop: {
                            select: { name: true },
                        },
                    },
                },
            },
        });

        const productMap = new Map<number, { name: string; image: string; shopName: string; quantity: number; revenue: number }>();
        orderItems.forEach((item) => {
            const fallbackImage = item.product?.images?.[0]?.imagePath || '';
            const shopName = item.product?.shop?.name || 'Cửa hàng';
            const existing = productMap.get(item.productId) || {
                name: item.productName || 'Sản phẩm không tên',
                image: item.productImage || fallbackImage || '',
                shopName,
                quantity: 0,
                revenue: 0,
            };
            existing.quantity += item.quantity;
            existing.revenue += item.quantity * Number(item.price);
            productMap.set(item.productId, existing);
        });

        const topProducts = Array.from(productMap.entries())
            .map(([id, data]) => {
                const imageUrl = data.image ? (data.image.startsWith('http') ? data.image : this.cloudinary.getUrl(data.image)) : '';
                return {
                    id,
                    name: data.name,
                    image: imageUrl,
                    shopName: data.shopName,
                    quantity: data.quantity,
                    revenue: data.revenue,
                };
            })
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Top performing shops
        const shopsWithDeliveredOrders = await this.prisma.order.findMany({
            where: {
                status: 'delivered',
            },
            select: {
                shopId: true,
                total: true,
                shop: {
                    select: {
                        name: true,
                        logo: true,
                        user: {
                            select: { name: true },
                        },
                    },
                },
            },
        });

        const shopMap = new Map<number, { name: string; logo: string; ownerName: string; orderCount: number; revenue: number }>();
        shopsWithDeliveredOrders.forEach((order) => {
            const existing = shopMap.get(order.shopId) || {
                name: order.shop?.name || 'Cửa hàng không tên',
                logo: (order.shop?.logo ? (order.shop.logo.startsWith('http') ? order.shop.logo : this.cloudinary.getUrl(order.shop.logo)) : '') || '',
                ownerName: order.shop?.user?.name || 'Không rõ',
                orderCount: 0,
                revenue: 0,
            };
            existing.orderCount += 1;
            existing.revenue += Number(order.total);
            shopMap.set(order.shopId, existing);
        });

        const topShops = Array.from(shopMap.entries())
            .map(([id, data]) => ({
                id,
                name: data.name,
                logo: data.logo,
                ownerName: data.ownerName,
                orderCount: data.orderCount,
                revenue: data.revenue,
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            summary: {
                totalRevenue,
                platformRevenue,
                totalOrders,
                totalProducts,
                totalShops,
                totalUsers,
                statusCounts,
            },
            chartData,
            topProducts,
            topShops,
        };
    }
}
