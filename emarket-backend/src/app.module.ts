import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { ShopModule } from './shop/shop.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CategoryModule } from './category/category.module';
import { ProductImageModule } from './product-image/product-image.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { GoogleStrategy } from './auth/strategies/google.strateegy';
import { ReviewModule } from './review/review.module';
import { RolesGuard } from './common/guards/roles.guard';
import { ChatModule } from './chat/chat.module';
import { VoucherModule } from './voucher/voucher.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SettlementModule } from './settlement/settlement.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { AddressModule } from './address/address.module';
import { BannerModule } from './banner/banner.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { ReportModule } from './report/report.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductModule,
    ShopModule,
    ReportModule,
    CloudinaryModule,
    CategoryModule,
    ProductImageModule,
    OrderModule,
    PaymentModule,
    ReviewModule,
    ChatModule,
    VoucherModule,
    WithdrawalModule,
    SettlementModule,
    ProductVariantModule,
    AddressModule,
    BannerModule,
    SystemConfigModule,
    NotificationModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule { }