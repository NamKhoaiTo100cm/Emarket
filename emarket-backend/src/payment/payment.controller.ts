import { Controller, Post, Param, ParseIntPipe, Body, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  // @Post('process/:orderId')
  // processPayment(
  //   @Param('orderId', ParseIntPipe) orderId: number,
  //   @Req() req: any,
  // ) {
  //   return this.paymentService.processPayment(orderId, req.user.id);
  // }

  // Endpoint này thực tế sẽ verify signature của gateway
  // Tạm thời để public
  @Public()
  @Post('webhook')
  handleWebhook(
    @Body() payload: { transactionId: string; orderId: number; status: 'success' | 'failed' },
  ) {
    // return this.paymentService.handleWebhook(payload);
  }


  @Post('momo/create')
  async createPayment(
    @Body() body: { orderIds: number[] },
    @Req() req,
  ) {
    return this.paymentService.processPayment(body.orderIds, req.user.id);
  }

  @Post('momo/verify')
  @Public()
  async verifyPayment(@Body() body: any) {
    return this.paymentService.verifyPayment(body);
  }

  // MoMo POST về đây — phải @Public()
  @Post('momo/ipn')
  @Public()
  async handleIpn(@Body() body: any) {
    return this.paymentService.handleIpn(body);
  }
}