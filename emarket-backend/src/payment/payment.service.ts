// import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { OrderService } from '../order/order.service';
// import { PrismaService } from '../prisma/prisma.service';
// import { ProductService } from '../product/product.service';

// @Injectable()
// export class PaymentService {
//   constructor(private prisma: PrismaService, private orderService: OrderService, private productService: ProductService) { }

//   // Bước 1: Frontend gọi để "gửi thanh toán" → trả về mock payment_url hoặc transaction_id
//   async processPayment(orderId: number, userId: number) {
//     const order = await this.prisma.order.findUnique({
//       where: { id: orderId },
//     });

//     if (!order) throw new NotFoundException('Order not found');
//     if (order.userId !== userId) throw new BadRequestException('Not your order');
//     if (order.paymentStatus !== 'pending')
//       throw new BadRequestException(`Payment already ${order.paymentStatus}`);

//     // Update sang "processing"
//     await this.prisma.order.update({
//       where: { id: orderId },
//       data: { paymentStatus: 'processing' },
//     });

//     // Mock: sinh transaction_id giả, thực tế đây là lúc gọi Momo/VNPay SDK
//     const mockTransactionId = `TXN_${Date.now()}_${orderId}`;

//     // Giả lập gateway xử lý xong rồi tự gọi webhook sau 3s
//     this.simulateGatewayCallback(orderId, mockTransactionId);

//     return {
//       transactionId: mockTransactionId,
//       message: 'Payment is being processed',
//       // Thực tế: trả payment_url để redirect user
//     };
//   }

//   // Bước 2: "Gateway" gọi webhook về sau khi xử lý xong
//   async handleWebhook(payload: { transactionId: string; orderId: number; status: 'success' | 'failed'; }) {
//     const { orderId, status } = payload;

//     const order = await this.prisma.order.findUnique({
//       where: { id: orderId },
//       include: {
//         items: {
//           select: {
//             productId: true,
//             quantity: true,
//           }
//         }
//       }
//     });

//     if (!order) throw new NotFoundException('Order not found');
//     if (order.paymentStatus !== 'processing')
//       throw new BadRequestException('Order not in processing state');

//     const paymentStatus = status === 'success' ? 'paid' : 'failed';
//     // const orderStatus = status === 'success' ? 'confirmed' : 'cancelled';

//     this.orderService.updatePaymentStatus(orderId, paymentStatus);
//     if (paymentStatus === 'paid') {
//       // await this.orderService.updateOrderStatus(orderId, '');
//       // increase product sold count
//       order.items.forEach(async (item) => {
//         await this.productService.increaseProductSales(item.productId, item.quantity);
//       });
//     }

//     return { received: true };
//   }

//   // Giả lập gateway callback sau 3 giây, random success/fail
//   private simulateGatewayCallback(orderId: number, transactionId: string) {
//     setTimeout(async () => {
//       const isSuccess = Math.random() > 0.2; // 80% success
//       await this.handleWebhook({
//         transactionId,
//         orderId,
//         status: isSuccess ? 'success' : 'failed',
//       });
//       console.log(`[Mock Gateway] Order ${orderId} → ${isSuccess ? 'PAID' : 'FAILED'}`);
//     }, 3000);
//   }
// }

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderService } from '../order/order.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly redirectUrl: string;
  private readonly ipnUrl: string;
  private readonly momoEndpoint =
    'https://test-payment.momo.vn/v2/gateway/api/create';

  constructor(
    private prisma: PrismaService,
    private orderService: OrderService,
    private productService: ProductService,
    private config: ConfigService,
  ) {
    this.partnerCode = this.config.get('MOMO_PARTNER_CODE') || "";
    this.accessKey = this.config.get('MOMO_ACCESS_KEY') || "";
    this.secretKey = this.config.get('MOMO_SECRET_KEY') || "";
    this.redirectUrl = this.config.get('MOMO_REDIRECT_URL') || "";
    this.ipnUrl = this.config.get('MOMO_IPN_URL') || "";
  }

  // Bước 1: Tạo payment request → trả payUrl để frontend redirect
  async processPayment(orderIds: number[], userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { id: { in: orderIds } },
    });

    if (orders.length !== orderIds.length)
      throw new NotFoundException('Một số order không tồn tại');

    if (orders.some(o => o.userId !== userId))
      throw new BadRequestException('Not your order');

    if (orders.some(o => o.paymentStatus !== 'pending'))
      throw new BadRequestException('Một số order đã được thanh toán');

    // Tổng tiền tất cả orders
    const totalAmount = orders.reduce((sum, o) => sum + Number(o.total), 0);

    // momoOrderId map nhiều order
    const momoOrderId = `ORDER-${orderIds.join('_')}-${Date.now()}`;
    const requestId = `${this.partnerCode}-${Date.now()}`;
    const orderInfo = `Thanh toan ${orderIds.length} don hang`;
    const extraData = '';
    const requestType = 'payWithMethod';

    const rawSignature = [
      `accessKey=${this.accessKey}`,
      `amount=${totalAmount}`,
      `extraData=${extraData}`,
      `ipnUrl=${this.ipnUrl}`,
      `orderId=${momoOrderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${this.partnerCode}`,
      `redirectUrl=${this.redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join('&');

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const { data } = await axios.post(this.momoEndpoint, {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount: totalAmount,
      orderId: momoOrderId,
      orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
    });

    if (data.resultCode !== 0) {
      throw new BadRequestException(`MoMo error: ${data.message}`);
    }

    // Update tất cả orders cùng lúc
    await this.prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: {
        paymentStatus: 'processing',
        momoOrderId, // tất cả cùng chung 1 momoOrderId
      },
    });

    return { payUrl: data.payUrl };
  }
  // Bước 2: MoMo gọi IPN về đây (server-to-server)
  async handleIpn(payload: any) {
    if (!this.verifyIpnSignature(payload)) {
      throw new BadRequestException('Invalid signature');
    }

    const { orderId: momoOrderId, resultCode, transId } = payload;

    const orders = await this.prisma.order.findMany({
      where: { momoOrderId },
      include: {
        items: { select: { productId: true, quantity: true } },
      },
    });

    if (!orders.length) throw new NotFoundException('Orders not found');

    // Idempotent check
    if (orders.every(o => o.paymentStatus !== 'processing'))
      return { received: true };

    const paymentStatus = resultCode === 0 ? 'paid' : 'failed';

    await this.prisma.order.updateMany({
      where: { momoOrderId },
      data: {
        paymentStatus,
        // Lưu mã giao dịch MoMo khi thanh toán thành công
        ...(paymentStatus === 'paid' && transId ? { momoTransId: String(transId) } : {}),
      },
    });

    if (paymentStatus === 'paid') {
      const allItems = orders.flatMap(o => o.items);
      await Promise.all(
        allItems.map(item =>
          this.productService.increaseProductSales(item.productId, item.quantity)
        )
      );
    }

    return { received: true };
  }

  private verifyIpnSignature(payload: any): boolean {
    const {
      accessKey, amount, extraData, message,
      orderId, orderInfo, orderType, partnerCode,
      payType, requestId, responseTime, resultCode,
      transId, signature,
    } = payload;

    const rawSignature = [
      `accessKey=${accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join('&');

    const expected = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    return expected === signature;
  }
}