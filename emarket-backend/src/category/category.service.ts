import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) { }
  async create(createCategoryDto: CreateCategoryDto) {
    if (createCategoryDto.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: {
          id: createCategoryDto.parentId
        }
      })
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
      if (parentCategory.requiresVerification && !createCategoryDto.requiresVerification) {
        throw new Error('Parent category requires verification');
      }
    }
    const checkExistCategory = await this.prisma.category.findUnique({
      where: {
        slug: createCategoryDto.slug
      }
    })
    if (checkExistCategory) {
      throw new Error('Category already exists');
    }
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany();
  }

  findOne(id: number) {
    return this.prisma.category.findUnique({
      where: {
        id: id
      }
    })
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: {
        id: id
      },
      data: updateCategoryDto,
    })
  }

  remove(id: number) {
    return this.prisma.category.delete({
      where: {
        id: id
      }
    });
  }
}
