import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CartService {
    constructor(
        private prisma: PrismaService,
        private cloudinaryService: CloudinaryService,
    ) { }

    /** Lấy toàn bộ giỏ hàng của user kèm thông tin product + variant */
    async getCart(userId: number) {
        const items = await this.prisma.cart.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        salePrice: true,
                        stock: true,
                        shopId: true,
                        images: { take: 1, select: { imagePath: true } },
                        shop: { select: { id: true, name: true, logo: true } },
                    },
                },
                variant: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        salePrice: true,
                        stock: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return items.map((item) => {
            if (item.product?.images && item.product.images.length > 0) {
                const image = item.product.images[0];
                const imagePath = (image.imagePath.startsWith('http')
                    ? image.imagePath
                    : this.cloudinaryService.getUrl(image.imagePath)) || '';
                item.product.images[0] = { ...image, imagePath };
            }
            return item;
        });
    }

    /** Thêm sản phẩm vào giỏ — nếu đã có thì tăng quantity */
    async addToCart(userId: number, productId: number, variantId?: number, quantity: number = 1) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, stock: true, status: true },
        });
        if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
        if (product.status !== 'active') {
            throw new BadRequestException('Sản phẩm này đã ngừng bán');
        }

        if (variantId) {
            const variant = await this.prisma.productVariant.findUnique({
                where: { id: variantId },
                select: { id: true, stock: true },
            });
            if (!variant) throw new NotFoundException('Biến thể không tồn tại');
        }

        // Tìm cart item hiện có (unique: userId + productId + variantId)
        const existing = await this.prisma.cart.findFirst({
            where: {
                userId,
                productId,
                variantId: variantId ?? null,
            },
        });

        let result;
        if (existing) {
            // Tăng số lượng
            result = await this.prisma.cart.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + quantity },
                include: {
                    product: { select: { id: true, name: true, price: true, salePrice: true, images: { take: 1, select: { imagePath: true } } } },
                    variant: { select: { id: true, name: true, price: true, salePrice: true } },
                },
            });
        } else {
            result = await this.prisma.cart.create({
                data: { userId, productId, variantId: variantId ?? null, quantity },
                include: {
                    product: { select: { id: true, name: true, price: true, salePrice: true, images: { take: 1, select: { imagePath: true } } } },
                    variant: { select: { id: true, name: true, price: true, salePrice: true } },
                },
            });
        }

        if (result.product?.images && result.product.images.length > 0) {
            const image = result.product.images[0];
            const imagePath = (image.imagePath.startsWith('http')
                ? image.imagePath
                : this.cloudinaryService.getUrl(image.imagePath)) || '';
            result.product.images[0] = { ...image, imagePath };
        }
        return result;
    }

    /** Cập nhật số lượng của 1 cart item */
    async updateQuantity(userId: number, cartItemId: number, quantity: number) {
        const item = await this.prisma.cart.findFirst({
            where: { id: cartItemId, userId },
        });
        if (!item) throw new NotFoundException('Không tìm thấy item trong giỏ hàng');

        if (quantity <= 0) {
            await this.prisma.cart.delete({ where: { id: cartItemId } });
            return null;
        }

        return this.prisma.cart.update({
            where: { id: cartItemId },
            data: { quantity },
        });
    }

    /** Xóa 1 item khỏi giỏ */
    async removeFromCart(userId: number, cartItemId: number) {
        const item = await this.prisma.cart.findFirst({
            where: { id: cartItemId, userId },
        });
        if (!item) throw new NotFoundException('Không tìm thấy item trong giỏ hàng');
        await this.prisma.cart.delete({ where: { id: cartItemId } });
        return { success: true };
    }

    /** Xóa toàn bộ giỏ hàng (gọi sau khi đặt hàng thành công) */
    async clearCart(userId: number) {
        await this.prisma.cart.deleteMany({ where: { userId } });
        return { success: true };
    }
}

