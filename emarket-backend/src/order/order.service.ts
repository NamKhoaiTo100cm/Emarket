import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductImage } from 'src/product-image/entities/product-image.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { VoucherService } from 'src/voucher/voucher.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService, private readonly cloudinaryService: CloudinaryService, private voucherService: VoucherService) { }
  async create(
    createOrderDto: CreateOrderDto,
    userId: number,
  ) {

    const productIds =
      createOrderDto.items.map(
        item => item.productId
      );

    const products =
      await this.prisma.product.findMany({
        where: {
          id: {
            in: productIds
          }
        },
        include: {
          images: {
            where: {
              isMain: true
            }
          },
          variants: true
        }
      });

    if (
      products.length !==
      productIds.length
    ) {
      throw new BadRequestException(
        "Some products not found"
      );
    }

    const shopCount =
      new Set(
        products.map(
          item => item.shopId
        )
      ).size;

    if (shopCount > 1) {
      throw new BadRequestException(
        "All products must belong to the same shop"
      );
    }

    const shopId =
      products[0].shopId;

    let subTotal = 0;

    const orderItems =
      products.map(product => {

        const requestItem =
          createOrderDto.items.find(
            item =>
              item.productId ===
              product.id
          );

        if (!requestItem) {
          throw new BadRequestException(
            "Product not found in request"
          );
        }

        const variant = requestItem.variantId
          ? product.variants.find(v => v.id === requestItem.variantId)
          : null;

        if (requestItem.variantId && !variant) {
          throw new BadRequestException(
            `Variant with id ${requestItem.variantId} not found for product ${product.name}`
          );
        }

        const itemPrice = variant ? Number(variant.price) : Number(product.price);

        const lineTotal =
          itemPrice *
          requestItem.quantity;

        subTotal += lineTotal;

        return {
          productId: product.id,
          quantity: requestItem.quantity,
          productName: product.name,
          price: itemPrice,
          productImage:
            product.images?.[0]
              ?.imagePath || "",
          variantId: variant ? variant.id : null,
          variantName: variant ? variant.name : null,
        };
      });

    // Phí vận chuyển theo phương thức giao hàng
    const shippingFeeMap: Record<string, number> = {
      standard: 30000,
      express: 50000,
      same_day: 80000,
    };
    const shippingFee = shippingFeeMap[createOrderDto.shippingMethod ?? 'standard'] ?? 30000;

    let shopDiscount = 0;

    // voucher shop
    if (createOrderDto.shopVoucherCode) {
      const voucher = await this.voucherService.validateVoucher(
        createOrderDto.shopVoucherCode,
        subTotal,
        shopId
      );
      shopDiscount = this.voucherService.calculateDiscount(voucher, subTotal);
    }

    const discount = shopDiscount;

    const total =
      subTotal +
      shippingFee -
      discount;

    const order =
      await this.prisma.order.create({
        data: {
          userId,
          shopId,

          subtotal: subTotal,
          shippingFee,
          discount,
          total,

          paymentMethod:
            createOrderDto.paymentMethod,

          shippingMethod:
            createOrderDto.shippingMethod,

          shippingAddress:
            createOrderDto.shippingAddress,

          receiverName:
            createOrderDto.receiverName,

          receiverPhone:
            createOrderDto.receiverPhone.toString(),

          note:
            createOrderDto.note,

          status: "pending",
          paymentStatus: "pending",

          items: {
            createMany: {
              data: orderItems
            }
          }
        },

        include: {
          items: true
        }
      });

    return order;
  }

  async findAll() {
    return await this.prisma.order.findMany({
      include: {
        items: true,
      }
    });
  }

  async findByShopId(shopId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const take = limit;
    const checkExistsShop = await this.prisma.shop.findUnique({
      where: {
        id: shopId
      }
    })
    if (!checkExistsShop) {
      throw new NotFoundException("Shop not found")
    }



    const [totalCount, orders] = await Promise.all([
      await this.prisma.order.count({
        where: {
          shopId: shopId
        }
      }),
      await this.prisma.order.findMany({
        where: {
          shopId: shopId
        },
        include: {
          items: true,
          returnRequest: true,
          user: {
            select: {
              name: true,
              phone: true,
            }
          }
        },
        skip,
        take,
        orderBy: {
          createdAt: "desc"
        }
      })
    ]);

    console.log("order", orders);
    const result = orders.map((item) => {
      if (item.items.length > 0) {
        const imageUrl = item.items.map((item) => {
          item.productImage = item.productImage?.startsWith('http')
            ? item.productImage
            : this.cloudinaryService.getUrl(item.productImage);
          return item;
        })
      }
      return item;
    })

    return { data: orders, pagination: { totalCount, page, limit } };
  }

  async findByUserId(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const take = limit;
    const [totalCount, orders] = await Promise.all([
      await this.prisma.order.count({
        where: {
          userId: userId
        }
      }),
      await this.prisma.order.findMany({
        where: {
          userId: userId
        },
        include: {
          items: true,
          returnRequest: true,
          shop: {
            select: {
              id: true,
              name: true,
              phone: true,
            }
          }
        },
        skip,
        take,
        orderBy: {
          createdAt: "desc"
        }
      })
    ]);
    const formatImage = orders.map((item) => {
      if (item.items.length > 0) {
        const imageUrl = item.items.map((item) => {
          item.productImage = item.productImage?.startsWith('http')
            ? item.productImage
            : this.cloudinaryService.getUrl(item.productImage);
          return item;
        })
      }
      if (item.returnRequest && item.returnRequest.images && item.returnRequest.images.length > 0) {
        item.returnRequest.images = item.returnRequest.images.map((img: string) => 
          img.startsWith('http') ? img : this.cloudinaryService.getUrl(img) || img
        );
      }
      return item;
    })
    return { data: formatImage, pagination: { totalCount, page, limit } };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: id
      },
      include: {
        items: true,
        returnRequest: true,
      }
    })
    if (!order) {
      throw new NotFoundException("Order not found")
    }
    if (order.returnRequest && order.returnRequest.images && order.returnRequest.images.length > 0) {
      order.returnRequest.images = order.returnRequest.images.map((img: string) => 
        img.startsWith('http') ? img : this.cloudinaryService.getUrl(img) || img
      );
    }
    return order;
  }

  async getPaymentStatus(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId
      },
      select: {
        paymentStatus: true,
      }
    })
    if (!order) {
      throw new NotFoundException("Order not found")
    }
    return order;
  }

  async updatePaymentStatus(orderId: number, status: 'paid' | 'failed') {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId
      }
    })
    if (!order) {
      throw new NotFoundException("Order not found")
    }
    if (order.paymentStatus === "paid") {
      throw new BadRequestException("Order is already paid")
    }
    await this.prisma.order.update({
      where: {
        id: orderId
      },
      data: {
        paymentStatus: status
      }
    })
    return {
      message: "Order payment status updated successfully"
    }
  }

  async updateOrderStatus(
    orderId: number,
    status: 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'returned',
    isFromSeller: boolean = false
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (isFromSeller) {
      if (status === 'confirmed' || status === 'cancelled') {
        if (order.status !== 'pending')
          throw new BadRequestException('Chỉ có thể xác nhận/hủy đơn hàng đang ở trạng thái chờ xử lý');
      } else if (status === 'shipping') {
        if (order.status !== 'confirmed')
          throw new BadRequestException('Chỉ có thể giao hàng khi đơn đã được xác nhận');
      } else {
        throw new BadRequestException('Seller không có quyền cập nhật trạng thái này');
      }
    }

    const updateData: any = { status };

    // Tự sinh mã vận đơn nội bộ khi chuyển sang shipping
    if (status === 'shipping') {
      updateData.trackingCode = `EMK${String(orderId).padStart(10, '0')}`;
    }

    if (status === 'delivered') {
      const settlementAt = new Date();
      settlementAt.setDate(settlementAt.getDate() + 3);
      updateData.settlementAt = settlementAt;

      await this.prisma.shopBalance.upsert({
        where: { shopId: order.shopId },
        update: { pendingBalance: { increment: order.total } },
        create: { shopId: order.shopId, pendingBalance: order.total, balance: 0 },
      });
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return { message: 'Order status updated successfully' };
  }

  async userConfirmDelivery(userId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.userId !== userId) throw new ForbiddenException('Bạn không có quyền xác nhận đơn hàng này');
    if (order.status !== 'shipping')
      throw new BadRequestException('Chỉ có thể xác nhận nhận hàng khi đơn đang được vận chuyển');

    const settlementAt = new Date();
    settlementAt.setDate(settlementAt.getDate() + 3);

    // COD: tự động chuyển paymentStatus → paid khi user xác nhận nhận hàng
    const paymentStatusUpdate = order.paymentMethod === 'cod' ? 'paid' : undefined;

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
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

    return { message: 'Xác nhận nhận hàng thành công' };
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async createReturnRequest(
    userId: number,
    orderId: number,
    data: { reason: string; bankName?: string; bankAccount?: string; bankOwner?: string; images?: string[] }
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { returnRequest: true },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.userId !== userId) throw new ForbiddenException('Bạn không có quyền yêu cầu hoàn hàng cho đơn hàng này');
    if (order.status !== 'delivered') throw new BadRequestException('Chỉ đơn hàng đã giao mới có thể yêu cầu hoàn hàng');
    if (order.isSettled || (order.settlementAt && order.settlementAt <= new Date())) {
      throw new BadRequestException('Đã quá thời hạn 3 ngày kể từ lúc giao hàng, không thể yêu cầu trả hàng');
    }
    if (order.returnRequest) throw new BadRequestException('Yêu cầu trả hàng cho đơn hàng này đã được tạo trước đó');
 
    return this.prisma.returnRequest.create({
      data: {
        orderId,
        reason: data.reason,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        bankOwner: data.bankOwner,
        images: data.images || [],
        status: 'PENDING',
      },
    });
  }

  async getReturnRequests(status?: any) {
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    const requests = await this.prisma.returnRequest.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
            },
            shop: {
              select: { name: true },
            },
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((req) => {
      if (req.images && req.images.length > 0) {
        req.images = req.images.map((img) => 
          img.startsWith('http') ? img : this.cloudinaryService.getUrl(img) || img
        );
      }
      return req;
    });
  }

  async resolveReturnRequest(id: number, status: 'APPROVED' | 'REJECTED', staffNote?: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!request) throw new NotFoundException('Yêu cầu hoàn hàng không tồn tại');
    if (request.status !== 'PENDING') throw new BadRequestException('Yêu cầu hoàn hàng đã được xử lý trước đó');

    const order = request.order;

    if (status === 'APPROVED') {
      const autoRefundNote = `[Hệ thống] Đã hoàn tiền tự động qua MoMo (Sandbox). ${staffNote || ''}`.trim();
      await this.prisma.$transaction([
        this.prisma.returnRequest.update({
          where: { id },
          data: { status, staffNote: autoRefundNote },
        }),
        this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'returned' },
        }),
        this.prisma.shopBalance.update({
          where: { shopId: order.shopId },
          data: { pendingBalance: { decrement: order.total } },
        }),
      ]);
    } else {
      await this.prisma.returnRequest.update({
        where: { id },
        data: { status, staffNote },
      });
    }

    return { message: `Yêu cầu hoàn hàng đã được ${status === 'APPROVED' ? 'chấp nhận' : 'từ chối'}` };
  }
}
