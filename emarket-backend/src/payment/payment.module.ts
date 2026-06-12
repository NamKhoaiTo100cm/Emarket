import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { OrderModule } from 'src/order/order.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [OrderModule, ProductModule]
})
export class PaymentModule { }
