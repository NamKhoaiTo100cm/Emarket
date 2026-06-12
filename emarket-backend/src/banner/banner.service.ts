import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(dto: CreateBannerDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Ảnh banner là bắt buộc');
    }

    const imagePublicId = await this.cloudinaryService.uploadFile(file, 'banners');

    return this.prisma.banner.create({
      data: {
        title: dto.title || null,
        image: imagePublicId,
        link: dto.link || null,
        position: dto.position || 'main',
        sortOrder: dto.sortOrder ?? 0,
        active: dto.active ?? true,
      },
    });
  }

  async findAll(onlyActive = false) {
    const banners = await this.prisma.banner.findMany({
      where: onlyActive ? { active: true } : undefined,
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return banners.map((banner) => ({
      ...banner,
      imageUrl: this.cloudinaryService.getUrl(banner.image),
    }));
  }

  async findOne(id: number) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner');
    }

    return {
      ...banner,
      imageUrl: this.cloudinaryService.getUrl(banner.image),
    };
  }

  async update(id: number, dto: UpdateBannerDto, file?: Express.Multer.File) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner');
    }

    let imagePublicId = banner.image;

    if (file) {
      // Xóa ảnh cũ
      try {
        await this.cloudinaryService.deleteFile(banner.image);
      } catch (err) {
        console.error('Lỗi khi xóa ảnh banner cũ từ Cloudinary:', err);
      }
      // Upload ảnh mới
      imagePublicId = await this.cloudinaryService.uploadFile(file, 'banners');
    }

    return this.prisma.banner.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title : banner.title,
        image: imagePublicId,
        link: dto.link !== undefined ? dto.link : banner.link,
        position: dto.position !== undefined ? dto.position : banner.position,
        sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : banner.sortOrder,
        active: dto.active !== undefined ? dto.active : banner.active,
      },
    });
  }

  async remove(id: number) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner');
    }

    // Xóa ảnh khỏi Cloudinary
    try {
      await this.cloudinaryService.deleteFile(banner.image);
    } catch (err) {
      console.error('Lỗi khi xóa ảnh banner từ Cloudinary:', err);
    }

    await this.prisma.banner.delete({
      where: { id },
    });

    return { message: 'Xóa banner thành công' };
  }
}
