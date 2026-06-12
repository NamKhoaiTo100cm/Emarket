import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  providers: [ShopService],
  controllers: [ShopController],
  imports: [CloudinaryModule],
})
export class ShopModule { }
