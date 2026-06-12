// roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) return true; // không yêu cầu role cụ thể

        const request = context.switchToHttp().getRequest();
        const user = request.user; // từ JwtAuthGuard

        return roles.includes(user.role);
    }
}