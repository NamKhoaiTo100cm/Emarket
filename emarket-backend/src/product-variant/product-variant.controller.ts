import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  // GET /product/:productId/variants — public
  @Public()
  @Get('product/:productId/variants')
  findByProductId(@Param('productId', ParseIntPipe) productId: number) {
    return this.productVariantService.findByProductId(productId);
  }

  // POST /product/:productId/variants — seller only
  @Roles('seller')
  @Post('product/:productId/variants')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createVariantDto: CreateVariantDto,
  ) {
    return this.productVariantService.create(productId, createVariantDto);
  }

  // PATCH /product-variant/:id — seller only
  @Roles('seller')
  @Patch('product-variant/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.productVariantService.update(id, updateVariantDto);
  }

  // DELETE /product-variant/:id — seller only
  @Roles('seller')
  @Delete('product-variant/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productVariantService.remove(id);
  }
}
