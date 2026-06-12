import { Injectable } from '@nestjs/common';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductImageService {
  constructor(private readonly cloudinaryService: CloudinaryService) { }

  async create(createProductImageDto: CreateProductImageDto, imageFiles: Express.Multer.File[]) {
    console.log("createProductImageDto", createProductImageDto)
    console.log("imageFiles", imageFiles)
    const uploadedImages = await Promise.all(
      imageFiles.map((imageFile) => this.cloudinaryService.uploadFile(imageFile, "images/products"))
    );
    return uploadedImages;
  }

  findAll() {
    return `This action returns all productImage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productImage`;
  }

  update(id: number, updateProductImageDto: UpdateProductImageDto) {
    return `This action updates a #${id} productImage`;
  }

  remove(id: number) {
    return `This action removes a #${id} productImage`;
  }
}
