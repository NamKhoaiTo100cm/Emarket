import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from 'src/generated/prisma/enums';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) { }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
  }

  async createStaff(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: { ...dto, password: hashedPassword, role: 'staff' },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, avatar: true, createdAt: true },
    });
  }

  async findOrCreateGoogleUser(data: {
    email: string;
    name: string;
    avatar?: string;
    googleId: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          avatar: data.avatar,
          googleId: data.googleId,
          password: null,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: data.googleId },
      });
    }

    return user;
  }

  async findAll(roles?: string[]) {
    const where: any = {};
    if (roles && roles.length > 0) {
      where.role = { in: roles };
    }
    return this.prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, status: true, avatar: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }


  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} không tồn tại`);
    const { password, hashRefreshToken, ...userRest } = user;
    return userRest;
  }

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id
      }
    })
    if (!user) throw new NotFoundException(`User ${id} không tồn tại`);
    const { password, hashRefreshToken, ...userRest } = user;
    if (userRest.avatar && !userRest.avatar.startsWith('http')) {
      userRest.avatar = this.cloudinary.getUrl(userRest.avatar);
    }
    return userRest;
  }

  async updateStatus(id: number, status: UserStatus) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { status: status },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
  }

  async updateProfile(userId: number, dto: UpdateUserDto, file?: Express.Multer.File) {
    await this.findOne(userId);

    if (file) {
      const publicId = await this.cloudinary.uploadFile(file, 'users/avatars');
      dto.avatar = publicId;
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    const { password, hashRefreshToken, ...userRest } = updatedUser;
    if (userRest.avatar && !userRest.avatar.startsWith('http')) {
      userRest.avatar = this.cloudinary.getUrl(userRest.avatar);
    }
    return userRest;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}