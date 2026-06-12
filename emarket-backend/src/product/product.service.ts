import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductStatus } from 'src/generated/prisma/enums';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService, private cloudinaryService: CloudinaryService) { }


  async create(dto: CreateProductDto, imageFiles: Express.Multer.File[]) {
    // check shop tồn tại (cái này hợp lý vì là business logic)
    const shop = await this.prisma.shop.findUnique({
      where: { id: dto.shopId },
      select: { id: true },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (dto.salePrice && dto.salePrice > dto.price) {
      throw new BadRequestException("Sale price must be less than price")
    }

    if (dto.stock < 0) {
      throw new BadRequestException("Stock must be greater than or equal to 0")
    }
    // console.log("dto", dto)
    // console.log("img", imageFiles)
    const uploadedImage = await Promise.all(
      imageFiles.map((file, index) =>
        this.cloudinaryService.uploadFile(file, 'product/images'),
      ),
    );

    return this.prisma.product.create({
      data: {
        ...dto,
        images: {
          create: uploadedImage.map((imagePath, index) => ({
            imagePath,
            isMain: index === 0,
          })),
        },
      },
    });
  }

  async toglleSellingProduct(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.status === ProductStatus.banned) {
      throw new BadRequestException('Product is banned');
    }
    const newStatus = product.status === ProductStatus.active
      ? ProductStatus.inactive  // unban → về inactive
      : ProductStatus.active;   // ban
    return this.prisma.product.update({
      where: { id: productId },
      data: { status: newStatus }
    });
  }

  async togglebanProduct(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStatus = product.status === ProductStatus.banned
      ? ProductStatus.inactive  // unban → về inactive
      : ProductStatus.banned;   // ban

    return this.prisma.product.update({
      where: { id: productId },
      data: { status: newStatus }
    });
  }
  async updateStatus(id: number, status: ProductStatus) {
    return this.prisma.product.update({
      where: { id },
      data: { status },
    });
  }

  async update(id: number, dto: UpdateProductDto, imageFiles: Express.Multer.File[]) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (dto.salePrice && dto.salePrice > dto.price) {
      throw new BadRequestException("Sale price must be less than price")
    }

    if (dto.stock < 0) {
      throw new BadRequestException("Stock must be greater than or equal to 0")
    }
    // console.log("dto", dto)
    // console.log("img", imageFiles)
    if (imageFiles.length > 0) {
      const deleteOldImage = await Promise.all(
        //delete old images
        product.images.map((file, index) => {
          return this.cloudinaryService.deleteFile(file.imagePath);
        })
      )
      // upload new images
      const uploadedImage = await Promise.all(
        imageFiles.map((file, index) =>
          this.cloudinaryService.uploadFile(file, 'product/images'),
        ),

      );
      console.log("deleteOldImage", deleteOldImage);
      console.log("uploadedImage", uploadedImage);

      return this.prisma.product.update({
        where: { id },
        data: {
          ...dto,
          images: {
            deleteMany: {
              productId: id,
            },
            create: uploadedImage.map((imagePath, index) => ({
              imagePath,
              isMain: index === 0,
            })),
          },
        },
      });
    } else {
      return this.prisma.product.update({
        where: { id },
        data: dto,
      });
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async findAll(page: number, limit: number, minRating: number, keyword: string, categorySlug: string, minPrice?: number, maxPrice?: number, status?: string) {
    keyword = keyword.trim();

    const where: any = {
      rating: { gte: minRating },
    };

    if (keyword) {
      where.name = { contains: keyword, mode: 'insensitive' };
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'deleted' };
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.OR = [
        { salePrice: { not: null, gte: minPrice, lte: maxPrice } },
        { salePrice: null, price: { gte: minPrice, lte: maxPrice } }
      ];
    } else if (minPrice !== undefined) {
      where.OR = [
        { salePrice: { not: null, gte: minPrice } },
        { salePrice: null, price: { gte: minPrice } }
      ];
    } else if (maxPrice !== undefined) {
      where.OR = [
        { salePrice: { not: null, lte: maxPrice } },
        { salePrice: null, price: { lte: maxPrice } }
      ];
    }

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { 
          images: { where: { isMain: true } },
          shop: { select: { name: true } },
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const result = products.map((item) => {
      if (item.images.length > 0) {
        const imageUrl = item.images[0].imagePath.startsWith('http')
          ? item.images[0].imagePath
          : this.cloudinaryService.getUrl(item.images[0].imagePath);
        const { images, ...productRest } = item;
        const { productId, imagePath, ...imageRest } = images[0];
        return { ...productRest, images: [{ ...imageRest, imageUrl }] };
      }
      return item;
    });

    return { data: result, pagination: { totalCount, page, limit } };
  }

  async findByIds(ids: number[]) {
    const products = await this.prisma.product.findMany(
      {
        where: {
          id: { in: ids },
        },
        include: {
          images: {
            where: { isMain: true },
          },
          variants: {
            orderBy: { sortOrder: 'asc' },
          },
          shop: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    );
    const result = products.map((item, index) => {
      if (item.images.length > 0) {
        const imageUrl = item.images[0].imagePath.startsWith('http')
          ? item.images[0].imagePath
          : this.cloudinaryService.getUrl(item.images[0].imagePath);
        const { images, ...productRest } = item;
        const { productId, imagePath, ...imageRest } = images[0];
        return { ...productRest, images: [{ ...imageRest, imageUrl }] }
      }
      return item;
    })


    return result;
  }

  async findByShopId(shopId: number, page = 1, limit = 10) {
    let products = await this.prisma.product.findMany(
      {
        where: {
          shopId,
          status: { not: ProductStatus.deleted },
        },
        include: {
          images: true,
          variants: { orderBy: { sortOrder: 'asc' } },
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc',
        },
      }
    );

    const result = products.map((item) => {
      if (item.images.length > 0) {
        const imageUrl = item.images[0].imagePath.startsWith('http')
          ? item.images[0].imagePath
          : this.cloudinaryService.getUrl(item.images[0].imagePath);
        const { images, ...productRest } = item;
        const { productId, imagePath, ...imageRest } = images[0];
        return { ...productRest, images: [{ ...imageRest, imageUrl }] }
        // return item
      }
      return item;
    })

    const totalCount = await this.prisma.product.count({
      where: {
        shopId,
        status: { not: ProductStatus.deleted },
      },
    });

    return { data: result, pagination: { totalCount, page, limit } };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });


    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let result: any = [];
    console.log("images", product.images)

    if (product.images.length > 0) {
      result = product.images.map((item, index) => {
        //const imageUrl = this.cloudinaryService.getUrl(item.imagePath);
        const imageUrl = item.imagePath.startsWith('http')
          ? item.imagePath
          : this.cloudinaryService.getUrl(item.imagePath);
        const { productId, imagePath, ...imageRest } = item;
        return { ...imageRest, imageUrl }
      })
    }
    console.log("result", result)

    const { images, ...productRest } = product;

    return { ...productRest, images: result }
  }

  async increaseProductSales(productId: number, quantity: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { soldCount: { increment: quantity } },
    });
  }



  async remove(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const deletedFiles = product.images.map((item) => {
      if (item.imagePath && !item.imagePath.startsWith('http')) {
        const pulicId = item.imagePath.split('/').pop()
        if (pulicId) {
          return this.cloudinaryService.deleteFile(`product/images/${pulicId}`)
        }
      }
    })

    const orders = await this.prisma.orderItem.findMany({
      where: {
        productId: id,
      },
    });
    if (orders.length > 0) {
      //soft delete
      return this.prisma.product.update({
        where: { id },
        data: { status: ProductStatus.deleted },
      });
      // throw new BadRequestException("Product is used in orders");
    } else {
      await Promise.all(deletedFiles)
      await this.prisma.product.delete({
        where: { id },
      });
    }

    await this.prisma.productImage.deleteMany({
      where: { productId: id },
    });
    return { success: true };
  }
}