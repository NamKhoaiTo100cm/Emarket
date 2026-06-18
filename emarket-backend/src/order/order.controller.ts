import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateReturnRequestDto, ResolveReturnRequestDto } from './dto/return-request.dto';
import { ReturnStatus } from '../generated/prisma/enums';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.orderService.create(createOrderDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get("shop/:shopId")
  async findByShopId(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query("page", ParseIntPipe) page: number,
    @Query("limit", ParseIntPipe) limit: number) {
    let res = await this.orderService.findByShopId(+shopId, page, limit)
    console.log("res", res)
    return res;
  }


  @Get("user")
  async findByUserId(
    @Query("page", ParseIntPipe) page: number,
    @Query("limit", ParseIntPipe) limit: number, @Req() req) {
    console.log("findByUserId req.user:", req.user);
    let userId = req.user.id;
    let res = await this.orderService.findByUserId(+userId, page, limit)
    console.log("res", res)
    return res;
  }

  @Get('admin/all')
  @Roles('staff', 'admin')
  async getAdminOrders(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.getAdminOrders(page, limit, keyword, status);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Public()
  @Get('payment-status/:orderId')
  getPaymentStatus(@Param('orderId') orderId: string) {
    return this.orderService.getPaymentStatus(+orderId);
  }

  @Patch('seller-update-order/:orderId')
  sellerUpdateOrderStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: { status: 'confirmed' | 'cancelled' | 'shipping' }
  ) {
    return this.orderService.updateOrderStatus(+orderId, body.status, true);
  }

  @Patch('user-cancel-order/:orderId')
  userCancelOrder(@Param('orderId', ParseIntPipe) orderId: number, @Req() req) {
    return this.orderService.userCancelOrder(req.user.id, orderId);
  }

  @Patch('user-confirm-delivery/:orderId')
  userConfirmDelivery(@Param('orderId', ParseIntPipe) orderId: number, @Req() req) {
    return this.orderService.userConfirmDelivery(req.user.id, orderId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }

  @Post(':id/return')
  @UseInterceptors(FilesInterceptor('proofImages', 5))
  async createReturn(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReturnRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req
  ) {
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => this.cloudinaryService.uploadFile(file, 'returns'));
      imageUrls = await Promise.all(uploadPromises);
    }
    return this.orderService.createReturnRequest(req.user.id, id, {
      ...dto,
      images: imageUrls,
    });
  }

  @Get('admin/returns')
  @Roles('staff', 'admin')
  getReturns(@Query('status') status?: ReturnStatus) {
    return this.orderService.getReturnRequests(status);
  }

  @Patch('admin/return/:id/resolve')
  @Roles('staff', 'admin')
  resolveReturn(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolveReturnRequestDto
  ) {
    return this.orderService.resolveReturnRequest(id, dto.status, dto.staffNote);
  }
}
