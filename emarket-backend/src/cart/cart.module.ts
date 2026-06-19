import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [PrismaModule, CloudinaryModule],
    providers: [CartService],
    controllers: [CartController],
    exports: [CartService],
})
export class CartModule { }
