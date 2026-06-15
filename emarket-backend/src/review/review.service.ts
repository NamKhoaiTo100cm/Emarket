import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '../generated/prisma/enums';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService, private readonly cloudinary: CloudinaryService) { }
  async create(createReviewDto: CreateReviewDto, userId: number) {
    console.log(createReviewDto);

    const review = await this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
      }
    });
    // update product's average rating
    const product = await this.prisma.product.findUnique({
      where: { id: createReviewDto.productId },
    });

    if (product) {
      const reviews = await this.prisma.review.findMany({
        where: { productId: createReviewDto.productId },
      });
      const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
      await this.prisma.product.update({
        where: { id: createReviewDto.productId },
        data: { rating: averageRating },
      });
    }
    return review;
  }

  async findAll() {
    const reviews = await this.prisma.review.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
        product: {
          select: {
            name: true,
            images: {
              where: {
                isMain: true,
              },
              select: {
                imagePath: true, // hoặc field ảnh của mày
              },
              take: 1
            },
          },
        },

      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const formattedReviews = reviews.map(review => {
      const imageUrl = review.product.images[0]?.imagePath ? !review.product.images[0].imagePath.startsWith("https") ? this.cloudinary.getUrl(review.product.images[0].imagePath, { width: 100, height: 100, crop: 'fill' }) : review.product.images[0].imagePath : null;
      const userAvatarUrl = review.user.avatar ? !review.user.avatar.startsWith("https") ? this.cloudinary.getUrl(review.user.avatar, { width: 100, height: 100, crop: 'fill' }) : review.user.avatar : null;
      const reviewImagesUrls = review.reviewImages?.map(img => 
        img && !img.startsWith("https") ? this.cloudinary.getUrl(img) : img
      ).filter(Boolean) ?? [];

      return {
        ...review,
        reviewImages: reviewImagesUrls,
        user: {
          ...review.user,
          avatar: userAvatarUrl
        },
        product: {
          ...review.product,
          images: [{ imagePath: imageUrl }]
        }
      };
    });
    console.log("reviews: ", formattedReviews)

    return formattedReviews;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  async findByProductId(productId: number, userId?: number) {
    const reviews = await this.prisma.review.findMany({
      where: { productId, isHidden: false },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
          }
        },
      },

    });
    const reviewableOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.confirmed,
        items: {
          some: { productId }
        },
        // Chưa có review nào cho combo này
        reviews: {
          none: {
            userId,
            productId,
          }
        }
      },
      select: { id: true }

    });

    const formattedReviews = reviews.map(review => {
      const userAvatarUrl = review.user.avatar ? !review.user.avatar.startsWith("https") ? this.cloudinary.getUrl(review.user.avatar, { width: 100, height: 100, crop: 'fill' }) : review.user.avatar : null;
      const reviewImagesUrls = review.reviewImages?.map(img => 
        img && !img.startsWith("https") ? this.cloudinary.getUrl(img) : img
      ).filter(Boolean) ?? [];

      return {
        ...review,
        reviewImages: reviewImagesUrls,
        user: {
          ...review.user,
          avatar: userAvatarUrl
        }
      };
    });

    console.log("reviewableOrder: ", reviewableOrder);
    return { reviews: formattedReviews, reviewableOrder };

    // const userHasOrdered = await this.prisma.order.findFirst({
    //   where: {
    //     userId: userId,
    //     items: {
    //       some: {
    //         productId
    //       }
    //     },
    //     status: OrderStatus.confirmed,
    //   }
    // });

  }

  async updateReviewHidden(id: number, isHidden: boolean) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });
    if (review) {
      await this.prisma.review.update({
        where: { id },
        data: { isHidden: isHidden },
      });
    }
    return review;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
