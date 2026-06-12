import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  async findByProductId(productId: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(productId: number, dto: CreateVariantDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.salePrice && dto.salePrice >= dto.price) {
      throw new BadRequestException('Sale price must be less than price');
    }

    return this.prisma.productVariant.create({
      data: { ...dto, productId },
    });
  }

  async update(id: number, dto: UpdateVariantDto) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!variant) throw new NotFoundException('Variant not found');

    const price = dto.price ?? variant.price;
    const salePrice = dto.salePrice ?? variant.salePrice;
    if (salePrice && Number(salePrice) >= Number(price)) {
      throw new BadRequestException('Sale price must be less than price');
    }

    return this.prisma.productVariant.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!variant) throw new NotFoundException('Variant not found');

    // Kiểm tra xem variant đã được dùng trong order chưa
    const usedInOrder = await this.prisma.orderItem.findFirst({ where: { variantId: id } });
    if (usedInOrder) {
      throw new BadRequestException('Variant đã được sử dụng trong đơn hàng, không thể xóa');
    }

    await this.prisma.productVariant.delete({ where: { id } });
    return { message: 'Xóa loại sản phẩm thành công' };
  }
}
