import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserAddressDto } from './dto/create-address.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, createAddressDto: CreateUserAddressDto) {
        const existingAddresses = await this.prisma.userAddress.count({
            where: { userId }
        });

        if (existingAddresses >= 5) {
            throw new BadRequestException('Số lượng địa chỉ tối đa là 5');
        }

        let isDefault = false
        if (existingAddresses === 0) {
            isDefault = true
        }

        if (createAddressDto.isDefault) {
            isDefault = true
        }

        if (isDefault) {
            await this.prisma.userAddress.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.userAddress.create({
            data: {
                userId,
                ...createAddressDto,
                isDefault,
            },
        });
    }

    async findAll(userId: number) {
        return this.prisma.userAddress.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' },
        });
    }

    async findOne(userId: number, id: number) {
        const address = await this.prisma.userAddress.findUnique({
            where: { id, userId }
        });

        if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
        return address;
    }

    async update(userId: number, id: number, updateAddressDto: UpdateUserAddressDto) {
        const address = await this.prisma.userAddress.findUnique({
            where: { id, userId }
        });

        if (!address) throw new NotFoundException('Địa chỉ không tồn tại');

        if (updateAddressDto.isDefault) {
            await this.prisma.userAddress.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.userAddress.update({
            where: { id },
            data: updateAddressDto,
        });
    }

    async remove(userId: number, id: number) {
        const address = await this.prisma.userAddress.findUnique({
            where: { id, userId }
        });

        if (!address) throw new NotFoundException('Địa chỉ không tồn tại');

        if (address.isDefault) {
            const otherAddresses = await this.prisma.userAddress.count({
                where: { userId, id: { not: id } }
            });

            if (otherAddresses > 0) {
                await this.prisma.userAddress.update({
                    where: { id: otherAddresses },
                    data: { isDefault: true }
                });
            }
        }

        return this.prisma.userAddress.delete({
            where: { id }
        });
    }

    async setDefault(userId: number, id: number) {
        const address = await this.prisma.userAddress.findUnique({
            where: { id, userId }
        });

        if (!address) throw new NotFoundException('Địa chỉ không tồn tại');

        if (address.isDefault) return address;

        return this.prisma.$transaction(async (tx) => {
            await tx.userAddress.updateMany({
                where: { userId },
                data: { isDefault: false }
            });

            return tx.userAddress.update({
                where: { id },
                data: { isDefault: true }
            });
        });
    }

    async getValidAddressesForOrder(userId: number, addressIds: number[]) {
        const addresses = await this.prisma.userAddress.findMany({
            where: {
                userId,
                id: { in: addressIds },
            },
        });

        if (addresses.length < addressIds.length) {
            throw new BadRequestException('Một hoặc nhiều địa chỉ không hợp lệ');
        }

        return addresses;
    }
}
