// roles.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) return true; // không yêu cầu role cụ thể

        const request = context.switchToHttp().getRequest();
        const user = request.user; // từ JwtAuthGuard

        if (!user) return false;

        const hasRole = roles.includes(user.role);
        if (!hasRole) return false;

        // Nếu user có role seller, kiểm tra shop có bị ban không
        if (user.role === 'seller') {
            const shop = await this.prisma.shop.findUnique({
                where: { userId: user.id },
                select: { status: true },
            });
            if (shop && shop.status === 'banned') {
                throw new ForbiddenException('Cửa hàng của bạn đã bị khóa. Không thể thực hiện thao tác này.');
            }
        }

        return true;
    }
}