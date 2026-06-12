import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('product-image')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) { }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'imageFiles', maxCount: 10 },
  ]))
  create(@Body() createProductImageDto: CreateProductImageDto, @UploadedFiles() imageFiles: Express.Multer.File[]) {
    return this.productImageService.create(createProductImageDto, imageFiles);
  }

  @Get()
  findAll() {
    return this.productImageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productImageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductImageDto: UpdateProductImageDto) {
    return this.productImageService.update(+id, updateProductImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productImageService.remove(+id);
  }
}
