import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, Query } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreatePlatformVoucherDto } from './dto/create-platform-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateShopVoucherDto } from './dto/create-shop-voucher.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) { }

  @Post("platform")
  @Roles("admin")
  createVoucherPlatfrom(@Body() dto: CreatePlatformVoucherDto) {
    return this.voucherService.createVoucherPlatform(dto);
  }

  @Post('shop')
  @Roles('seller')
  createShop(@Body() dto: CreateShopVoucherDto, @Req() req: any) {
    return this.voucherService.createShopVoucher(dto, +req.user.id);
  }


  @Get()
  @Roles('admin', 'seller')
  findAll(@Req() req: any) {
    return this.voucherService.findAll(+req.user.id, req.user.role);
  }

  @Get('validate/shop')
  @Public()
  async validateShopVoucher(
    @Query('code') code: string,
    @Query('orderTotal') orderTotal: string,
    @Query('shopId') shopId: number,
  ) {
    const voucher = await this.voucherService.validateVoucher(code, Number(orderTotal), Number(shopId));
    const discount = this.voucherService.calculateDiscount(voucher, Number(orderTotal));
    return {
      statusCode: 200,
      message: 'Áp dụng voucher thành công',
      data: {
        discount: Number(voucher.discountValue),
        discountType: voucher.discountType,
        discountAmount: discount,
        voucherCode: voucher.code,
      },
    };
  }

  @Get(':id')
  @Roles('admin', 'seller')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.voucherService.findOne(id);
  }


  @Patch(':id')
  @Roles('admin', 'seller')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVoucherDto,
    @Req() req: any,
  ) {
    return this.voucherService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.voucherService.remove(id, +req.user.id, req.user.role);
  }
}
