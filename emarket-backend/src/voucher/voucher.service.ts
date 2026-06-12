import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlatformVoucherDto } from './dto/create-platform-voucher.dto';
import { CreateShopVoucherDto } from './dto/create-shop-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { VoucherScope } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { Voucher } from '../generated/prisma/client';

@Injectable()
export class VoucherService {
  constructor(private prisma: PrismaService) { }
  async createVoucherPlatform(createVoucherDto: CreatePlatformVoucherDto) {
    await this.checkPlatformCodeDuplicate(createVoucherDto.code)
    await this.prisma.voucher.create({
      data: {
        code: createVoucherDto.code.toUpperCase(),
        discountType: createVoucherDto.discountType,
        discountValue: createVoucherDto.discountValue,
        minOrder: createVoucherDto.minOrder,
        maxDiscount: createVoucherDto.maxDiscount,
        maxUses: createVoucherDto.maxUses,
        startAt: createVoucherDto.startAt,
        expiresAt: createVoucherDto.expiresAt,
        active: createVoucherDto.active,
        scope: VoucherScope.platform,

      }
    })
    return 'This action adds a new voucher';
  }

  async createShopVoucher(dto: CreateShopVoucherDto, userId: number) {
    const shop = await this.prisma.shop.findUniqueOrThrow({ where: { userId } });
    return this.prisma.voucher.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        scope: VoucherScope.shop,
        shopId: shop.id,
        startAt: dto.startAt ? new Date(dto.startAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async findAll(userId: number, role: string) {
    if (role === "admin") {
      return this.prisma.voucher.findMany({
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      })
    }
    const shop = await this.prisma.shop.findUnique({ where: { userId } });
    if (!shop) throw new NotFoundException('Shop not found');
    return this.prisma.voucher.findMany({
      where: { shopId: shop.id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })
  }

  async findOne(id: number) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })
    if (!voucher) throw new Error('Voucher not found');
    return voucher;
  }

  async update(id: number, dto: UpdateVoucherDto, userId: number, role: string) {
    const voucher = await this.findOne(id);
    if (role === 'seller') {
      const shop = await this.prisma.shop.findUnique({ where: { userId } });
      if (!shop || voucher.shopId !== shop.id) {
        throw new ForbiddenException('Không có quyền sửa voucher này');
      }
    }
    return this.prisma.voucher.update({
      where: { id },
      data: {
        ...dto,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async remove(id: number, userId: number, role: string) {
    const voucher = await this.findOne(id);
    if (role === 'seller') {
      const shop = await this.prisma.shop.findUnique({ where: { userId } });
      if (!shop || voucher.shopId !== shop.id) {
        throw new ForbiddenException('Không có quyền xóa voucher này');
      }
    }
    if (voucher.usedCount > 0) {
      return this.prisma.voucher.update({ where: { id }, data: { active: false } });
    }
    return await this.prisma.voucher.delete({
      where: { id },
    });
  }


  async validateVoucher(code: string, orderTotal: number, shopId?: number) {
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        code: code.toUpperCase(),
        active: true,
        // platform thì shopId = null, shop thì match shopId
        ...(shopId ? { scope: 'shop', shopId } : { scope: 'platform' }),
      },
    });

    if (!voucher) throw new NotFoundException('Voucher không tồn tại');
    if (voucher.usedCount >= voucher.maxUses) throw new BadRequestException('Voucher đã hết lượt dùng');
    if (voucher.expiresAt && voucher.expiresAt < new Date()) throw new BadRequestException('Voucher đã hết hạn');
    if (voucher.startAt && voucher.startAt > new Date()) throw new BadRequestException('Voucher chưa có hiệu lực');
    if (orderTotal < Number(voucher.minOrder)) throw new BadRequestException(`Đơn tối thiểu ${voucher.minOrder}đ`);

    return voucher;
  }

  calculateDiscount(voucher: Voucher, orderTotal: number): number {
    let discount = 0;

    if (voucher.discountType === 'percent') {
      discount = Math.floor(orderTotal * Number(voucher.discountValue) / 100);
      // cap lại nếu có maxDiscount
      if (voucher.maxDiscount) {
        discount = Math.min(discount, Number(voucher.maxDiscount));
      }
    } else {
      // fixed
      discount = Number(voucher.discountValue);
    }

    // không giảm quá tổng đơn
    return Math.min(discount, orderTotal);
  }

  private async checkPlatformCodeDuplicate(code: string) {
    const existing = await this.prisma.voucher.findFirst({
      where: { code: code.toUpperCase(), scope: VoucherScope.platform },
    });
    if (existing) throw new ConflictException(`Code "${code}" đã tồn tại`);
  }
}
