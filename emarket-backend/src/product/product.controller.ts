import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, ParseIntPipe, Query, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from '../common/decorators/public.decorator';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @UseInterceptors(FilesInterceptor('imageFiles', 10))

  async create(@Body() createProductDto: CreateProductDto, @UploadedFiles() imageFiles: Express.Multer.File[]) {
    if (imageFiles.length === 0) {
      throw new BadRequestException("Image is required at least 1 image");

    }
    return this.productService.create(createProductDto, imageFiles);
  }

  @Roles('staff')
  @Patch(':id/ban')
  async togglebanProduct(@Param('id') id: string) {
    return this.productService.togglebanProduct(+id);
  }

  @Roles('staff', 'admin')
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.productService.updateStatus(+id, status);
  }

  @Roles('seller')
  @Patch(':id/toggle-selling')
  async toggleSellingProduct(@Param('id') id: string) {
    return this.productService.toglleSellingProduct(+id);
  }

  @Public()
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('imageFiles', 10))
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @UploadedFiles() imageFiles: Express.Multer.File[]) {
    if (!imageFiles || imageFiles.length === 0) {
      throw new BadRequestException("Image is required at least 1 image");

    }
    console.log("updateProductDto", updateProductDto);
    console.log("imageFiles", imageFiles);
    await this.productService.update(+id, updateProductDto, imageFiles);
    return { message: "Cập nhật sản phẩm thành công" };
  }

  @Public()
  @Get()
  async findAll(
    @Req() req: any,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('minRating', ParseIntPipe) minRating: number = 0,
    @Query('keyword') keyword: string = "",
    @Query('categorySlug') categorySlug: string = "",
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('status') status?: string,
  ) {
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    return this.productService.findAll(page, limit, minRating, keyword, categorySlug, min, max, status, req);
  }

  @Public()
  @Get('/by-ids')
  findByIds(@Req() req: any, @Query('ids') ids: string) {
    if (!ids) throw new BadRequestException('ids is required');

    const parsedIds = ids
      .split(',')
      .map(Number)
      .filter(id => Number.isInteger(id) && id > 0);

    if (parsedIds.length === 0)
      throw new BadRequestException('No valid ids provided');

    return this.productService.findByIds(parsedIds, req);
  }

  @Public()
  @Get('shop/:shopId')
  async findByShopId(
    @Req() req: any,
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.productService.findByShopId(shopId, page, limit, req);
  }

  @Public()
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.productService.findOne(+id, req);
  }



  @Delete(':id')
  @Roles('staff', 'admin', 'seller')
  async remove(@Param('id') id: string) {
    await this.productService.remove(+id);
    return { message: "Xóa sản phẩm thành công" };
  }
}
