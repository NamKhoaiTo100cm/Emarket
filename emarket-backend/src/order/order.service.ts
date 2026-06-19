import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProductImage } from '../product-image/entities/product-image.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { VoucherService } from '../voucher/voucher.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private voucherService: VoucherService,
    private notificationService: NotificationService,
  ) { }
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

    const inactiveProduct = products.find(p => p.status !== 'active');
    if (inactiveProduct) {
      throw new BadRequestException(
        `Sản phẩm "${inactiveProduct.name}" đã ngừng bán`
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
    let voucherId: number | null = null;

    // voucher shop
    if (createOrderDto.shopVoucherCode) {
      const voucher = await this.voucherService.validateVoucher(
        createOrderDto.shopVoucherCode,
        subTotal,
        shopId
      );
      shopDiscount = this.voucherService.calculateDiscount(voucher, subTotal);
      voucherId = voucher.id;
    }

    const discount = shopDiscount;

    const total =
      subTotal +
      shippingFee -
      discount;

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          shopId,
          voucherId,
          subtotal: subTotal,
          shippingFee,
          discount,
          total,
          paymentMethod: createOrderDto.paymentMethod,
          shippingMethod: createOrderDto.shippingMethod ?? 'standard',
          shippingAddress: createOrderDto.shippingAddress,
          receiverName: createOrderDto.receiverName,
          receiverPhone: createOrderDto.receiverPhone.toString(),
          note: createOrderDto.note,
          status: "pending",
          paymentStatus: "pending",
          items: {
            createMany: {
              data: orderItems,
            },
          },
        },
        include: {
          items: true,
        },
      });

      if (voucherId) {
        await tx.voucher.update({
          where: { id: voucherId },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      return createdOrder;
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

  async findByShopId(shopId: number, page: number, limit: number, status?: string, keyword?: string) {
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

    const whereCondition: any = {
      shopId: shopId,
      OR: [
        { paymentMethod: 'cod' as const },
        { paymentStatus: 'paid' as const }
      ]
    };

    if (status && status !== 'all') {
      whereCondition.status = status as any;
    }

    if (keyword) {
      const searchConditions: any[] = [];
      const parsedId = parseInt(keyword, 10);
      if (!isNaN(parsedId)) {
        searchConditions.push({ id: parsedId });
      }

      searchConditions.push(
        {
          receiverName: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          receiverPhone: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          user: {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            phone: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        },
        {
          trackingCode: {
            contains: keyword,
            mode: 'insensitive',
          },
        }
      );
      whereCondition.AND = [
        { OR: searchConditions }
      ];
    }

    const [totalCount, orders] = await Promise.all([
      await this.prisma.order.count({
        where: whereCondition
      }),
      await this.prisma.order.findMany({
        where: whereCondition,
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

    if (status === 'cancelled') {
      if (order.paymentStatus === 'paid') {
        updateData.paymentStatus = 'refunded';
      }
    }

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

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    try {
      let title = '';
      let message = '';
      if (status === 'confirmed') {
        title = 'Đơn hàng đã được xác nhận';
        message = `Đơn hàng #${orderId} của bạn đã được shop xác nhận và đang được chuẩn bị.`;
      } else if (status === 'shipping') {
        title = 'Đơn hàng đang giao';
        message = `Đơn hàng #${orderId} của bạn đã được bàn giao cho đơn vị vận chuyển. Mã vận đơn: ${updateData.trackingCode || order.trackingCode || ''}`;
      } else if (status === 'delivered') {
        title = 'Giao hàng thành công';
        message = `Đơn hàng #${orderId} của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại Emarket!`;
      } else if (status === 'cancelled') {
        title = 'Đơn hàng đã bị hủy';
        message = order.paymentStatus === 'paid'
          ? `Đơn hàng #${orderId} của bạn đã bị shop hủy. Số tiền ${Number(order.total).toLocaleString('vi-VN')} đ đã được hoàn tự động về ví MoMo của bạn.`
          : `Đơn hàng #${orderId} của bạn đã bị shop hủy.`;
      }

      if (title && message) {
        await this.notificationService.createNotification(order.userId, title, message, 'order');
      }
    } catch (err) {
      console.error('Lỗi khi tạo thông báo cập nhật đơn hàng:', err);
    }

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

    try {
      await this.notificationService.createNotification(
        order.userId,
        'Giao hàng thành công',
        `Đơn hàng #${orderId} của bạn đã được xác nhận giao thành công. Cảm ơn bạn đã mua sắm tại Emarket!`,
        'order'
      );
    } catch (err) {
      console.error('Lỗi khi tạo thông báo giao hàng thành công:', err);
    }

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
          data: { status: 'returned', paymentStatus: 'refunded' },
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

  async getAdminOrders(page: number, limit: number, keyword?: string, status?: string) {
    const skip = (page - 1) * limit;
    const take = limit;

    const whereClause: any = {};

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (keyword) {
      const searchConditions: any[] = [];
      const parsedId = parseInt(keyword, 10);
      if (!isNaN(parsedId)) {
        searchConditions.push({ id: parsedId });
      }

      searchConditions.push(
        {
          user: {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            phone: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        },
        {
          shop: {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        },
        {
          trackingCode: {
            contains: keyword,
            mode: 'insensitive',
          },
        }
      );
      whereClause.OR = searchConditions;
    }

    const [totalCount, orders] = await Promise.all([
      this.prisma.order.count({
        where: whereClause,
      }),
      this.prisma.order.findMany({
        where: whereClause,
        include: {
          items: true,
          returnRequest: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const formattedOrders = orders.map((item) => {
      if (item.items && item.items.length > 0) {
        item.items = item.items.map((orderItem) => {
          orderItem.productImage = orderItem.productImage?.startsWith('http')
            ? orderItem.productImage
            : this.cloudinaryService.getUrl(orderItem.productImage);
          return orderItem;
        });
      }
      if (item.returnRequest && item.returnRequest.images && item.returnRequest.images.length > 0) {
        item.returnRequest.images = item.returnRequest.images.map((img: string) =>
          img.startsWith('http') ? img : this.cloudinaryService.getUrl(img) || img
        );
      }
      return item;
    });

    return { data: formattedOrders, pagination: { totalCount, page, limit } };
  }

  async userCancelOrder(userId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.userId !== userId) throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này');
    if (order.status !== 'pending') throw new BadRequestException('Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý');

    let paymentStatusUpdate: string | undefined = undefined;
    if (order.paymentStatus === 'processing' || order.paymentStatus === 'pending') {
      paymentStatusUpdate = 'failed';
    } else if (order.paymentStatus === 'paid') {
      paymentStatusUpdate = 'refunded';
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        ...(paymentStatusUpdate ? { paymentStatus: paymentStatusUpdate as any } : {})
      }
    });

    try {
      await this.notificationService.createNotification(
        order.userId,
        'Đơn hàng đã bị hủy',
        order.paymentStatus === 'paid'
          ? `Đơn hàng #${orderId} của bạn đã được hủy thành công. Số tiền ${Number(order.total).toLocaleString('vi-VN')} đ đã được hoàn tự động về ví MoMo của bạn.`
          : `Đơn hàng #${orderId} của bạn đã được hủy thành công.`,
        'order'
      );
    } catch (err) {
      console.error('Lỗi khi tạo thông báo hủy đơn hàng:', err);
    }

    return { message: 'Hủy đơn hàng thành công' };
  }
}
